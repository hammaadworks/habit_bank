# Go-Live: Deployment Guide

This guide details the process for deploying the Habit Bank application across two environments:
1. **Frontend**: GitHub Pages (Static HTML/CSS/JS)
2. **Backend**: Amazon Web Services (AWS)

## 1. Frontend Deployment (GitHub Pages)

The Next.js frontend is configured for a **Static HTML Export**, which is fully compatible with GitHub Pages.

### Prerequisites
- The frontend must be in the root of its own repository, or deployed via GitHub Actions from a specific path.
- In `frontend/next.config.ts`, ensure `output: 'export'` and `images: { unoptimized: true }` are set (they are currently configured this way).

### Deployment Steps (via GitHub Actions)

1. Create a workflow file at `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Next.js site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Detect package manager
        id: detect-package-manager
        run: |
          if [ -f "pnpm-lock.yaml" ]; then
            echo "manager=pnpm" >> $GITHUB_OUTPUT
            echo "command=install" >> $GITHUB_OUTPUT
            echo "runner=pnpm" >> $GITHUB_OUTPUT
            exit 0
          else
            echo "Unable to determine package manager"
            exit 1
          fi
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: |
            frontend/.next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('frontend/pnpm-lock.yaml') }}-${{ hashFiles('frontend/src/**') }}
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('frontend/pnpm-lock.yaml') }}-
      - name: Install dependencies
        run: ${{ steps.detect-package-manager.outputs.manager }} ${{ steps.detect-package-manager.outputs.command }}
      - name: Build with Next.js
        run: ${{ steps.detect-package-manager.outputs.runner }} next build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./frontend/out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. **Configure API URL**: Ensure your frontend has an environment variable (e.g., `.env.production`) pointing to your AWS backend:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

3. Push to `main`. GitHub Actions will automatically build the static files (`out/` directory) and deploy them to GitHub Pages.

---

## 2. Backend Deployment (AWS)

The FastAPI backend can be deployed to AWS using **AWS App Runner** (easiest for containers) or **EC2** (more control). Below is the recommended EC2 + Docker approach.

### Prerequisites
- An AWS Account.
- Docker installed on your local machine.

### Deployment Steps (EC2 + Docker Compose)

1. **Launch an EC2 Instance**:
   - Spin up an Ubuntu EC2 instance (e.g., `t3.micro` is sufficient for starting).
   - Configure Security Groups to allow inbound traffic on ports `80` (HTTP), `443` (HTTPS), and `22` (SSH).

2. **Create a `Dockerfile`** in the `backend/` directory:
   ```dockerfile
   FROM python:3.12-slim
   WORKDIR /app
   COPY pyproject.toml uv.lock ./
   RUN pip install uv && uv pip install --system -r pyproject.toml
   COPY . .
   EXPOSE 8000
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

3. **Deploy via SSH**:
   - SSH into your EC2 instance.
   - Clone your repository: `git clone https://github.com/hammaadworks/HabitBank.git`
   - Navigate to the backend: `cd HabitBank/backend`
   - Build and run the container:
     ```bash
     sudo apt update && sudo apt install docker.io docker-compose -y
     sudo docker build -t habit-bank-api .
     sudo docker run -d -p 80:8000 --name api --restart always habit-bank-api
     ```

4. **Set Up a Reverse Proxy & HTTPS (Nginx & Certbot)**:
   - Install Nginx: `sudo apt install nginx -y`
   - Configure Nginx to proxy port 80 to 8000.
   - Run Certbot to secure the API with Let's Encrypt: `sudo apt install certbot python3-certbot-nginx -y && sudo certbot --nginx`

5. **CORS Configuration**:
   - In `backend/app/main.py`, ensure the `CORSMiddleware` allows your GitHub Pages domain:
     ```python
     app.add_middleware(
         CORSMiddleware,
         allow_origins=["https://hammaadworks.github.io"],
         allow_credentials=True,
         allow_methods=["*"],
         allow_headers=["*"],
     )
     ```
