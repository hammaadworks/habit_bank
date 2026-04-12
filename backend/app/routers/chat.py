from fastapi import APIRouter, Depends, Request, Header, HTTPException
from fastapi.responses import StreamingResponse
import uuid
import json
from pydantic import BaseModel
from typing import List
from app.database import get_session, SessionDep
from app.core.ai_agent import habit_agent, HabitContext

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_id: uuid.UUID
    messages: List[ChatMessage]

async def stream_agent_response(request: ChatRequest, ctx: HabitContext, prompt: str):
    # Dynamic Model Initialization based on BYOK
    # This approach is thread-safe as it instantiates a fresh model with the provided key per request.
    try:
        if ctx.provider == "anthropic":
            from pydantic_ai.models.anthropic import AnthropicModel
            model_name = ctx.ai_model or "claude-3-5-sonnet-latest"
            kwargs = {"api_key": ctx.api_key}
            if ctx.ai_url:
                kwargs["base_url"] = ctx.ai_url
            model = AnthropicModel(model_name, **kwargs)
        elif ctx.provider == "google-gla":
            from pydantic_ai.models.gemini import GeminiModel
            model_name = ctx.ai_model or "gemini-1.5-pro"
            kwargs = {"api_key": ctx.api_key}
            model = GeminiModel(model_name, **kwargs)
        else: # openai or custom
            from pydantic_ai.models.openai import OpenAIModel
            model_name = ctx.ai_model or "gpt-4o"
            kwargs = {"api_key": ctx.api_key or "dummy-key"}
            if ctx.ai_url:
                kwargs["base_url"] = ctx.ai_url
            model = OpenAIModel(model_name, **kwargs)

        async with habit_agent.run_stream(prompt, deps=ctx, model=model) as result:
            async for text_chunk in result.stream_text(delta=True):
                yield f"data: {json.dumps({'type': 'text', 'content': text_chunk})}\n\n"
            
            # Stream tool calls if any
            for msg in result.new_messages():
                if hasattr(msg, 'parts'):
                    for part in msg.parts:
                        if part.part_kind == 'tool-call':
                            yield f"data: {json.dumps({'type': 'tool', 'name': part.tool_name, 'args': part.args.args_dict})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

@router.post("/stream")
async def chat_stream(
    req: ChatRequest, 
    session: SessionDep, 
    x_ai_provider: str = Header(default="openai"), 
    x_ai_key: str = Header(default=""),
    x_ai_model: str | None = Header(default=None),
    x_ai_url: str | None = Header(default=None)
):
    if not x_ai_key and x_ai_provider != "custom":
        raise HTTPException(status_code=400, detail="Missing API Key in headers (BYOK required).")
        
    ctx = HabitContext(user_id=req.user_id, session=session, provider=x_ai_provider, api_key=x_ai_key, ai_model=x_ai_model, ai_url=x_ai_url)
    prompt = req.messages[-1].content
    
    return StreamingResponse(stream_agent_response(req, ctx, prompt), media_type="text/event-stream")
