"use client";

import { useTransition } from "react";
import {
  BOT_TASK_STATUS_LABEL,
  type BotTaskStatus,
} from "@/server/domain/tasks";

type Props = {
  taskId: string;
  value: BotTaskStatus;
  action: (
    taskId: string,
    status: BotTaskStatus,
  ) => Promise<{ ok: boolean; error?: string }>;
};

export function TaskStatusSelect({ taskId, value, action }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      name="status"
      defaultValue={value}
      disabled={pending}
      className="rounded-md border border-dash-border bg-dash-input px-2 py-1.5 text-xs text-dash-text"
      onChange={(e) => {
        const status = e.target.value as BotTaskStatus;
        startTransition(async () => {
          await action(taskId, status);
        });
      }}
    >
      {(Object.keys(BOT_TASK_STATUS_LABEL) as BotTaskStatus[]).map((s) => (
        <option key={s} value={s}>
          {BOT_TASK_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
