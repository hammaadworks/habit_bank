"use client";

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { formatTimezoneOffset, parseTimezoneOffset } from '@/lib/utils';
import { User } from '@/types';

export function TimezoneSetting({ user, onUpdate }: { user: User, onUpdate: () => void }) {
  const [localVal, setLocalVal] = useState(formatTimezoneOffset(user.timezone_offset || 0));

  useEffect(() => {
    setLocalVal(formatTimezoneOffset(user.timezone_offset || 0));
  }, [user.timezone_offset]);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Timezone / GMT Offset</label>
        <button 
          onClick={async () => {
            const browserOffset = -new Date().getTimezoneOffset();
            try {
              await fetchApi(`/users/${user.id}`, {
                method: "PATCH",
                body: JSON.stringify({ timezone_offset: browserOffset })
              });
              onUpdate();
            } catch (err) { console.error(err); }
          }}
          className="text-xxs font-bold text-primary hover:underline uppercase tracking-tighter"
        >
          Auto-Detect
        </button>
      </div>
      <input 
        type="text"
        placeholder="GMT +05:30"
        value={localVal}
        onChange={(e) => {
          setLocalVal(e.target.value);
          const val = parseTimezoneOffset(e.target.value);
          if (val !== null) {
            fetchApi(`/users/${user.id}`, {
              method: "PATCH",
              body: JSON.stringify({ timezone_offset: val })
            }).then(() => onUpdate()).catch(err => console.error(err));
          }
        }}
        className="p-4 bg-muted/50 border border-border rounded-2xl font-bold font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <p className="text-xxs text-muted-foreground px-1 uppercase tracking-tighter">Enter as GMT +05:30 or +05:30</p>
    </div>
  );
}
