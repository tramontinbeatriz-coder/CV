"use client";

import { useActionState, useTransition } from "react";
import { loginAction, type ActionState } from "../actions";
import { SubmitButton } from "@/components/admin/client";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {});
  const [, start] = useTransition();
  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(() => action(fd));
      }}
    >
      <label className="block">
        <span className="a-label">e-mail</span>
        <input name="email" type="email" autoComplete="username" required className="a-input" />
      </label>
      <label className="block">
        <span className="a-label">senha</span>
        <input name="password" type="password" autoComplete="current-password" required className="a-input" />
      </label>
      {state.error && <p role="alert" className="text-sm text-[#9d2748]">{state.error}</p>}
      <SubmitButton pending={pending} className="a-btn a-btn-primary w-full !py-3">entrar</SubmitButton>
    </form>
  );
}
