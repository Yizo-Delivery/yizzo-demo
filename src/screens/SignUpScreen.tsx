'use client';

import { useState, type FormEvent } from 'react';
import { Button, Field } from '@/components/ui';
import { useDemo } from '@/demo/DemoProvider';

export function SignUpScreen() {
  const { story, dispatch } = useDemo();
  const [name, setName] = useState(story?.sender.name ?? '');
  const [email, setEmail] = useState(story?.sender.email ?? '');
  const valid = name.trim() !== '' && email.trim() !== '';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) dispatch({ type: 'signUp', name, email });
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-slate-600">You&apos;ll verify your identity next.</p>
      </div>
      <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Button type="submit" disabled={!valid} className="mt-auto">
        Create account
      </Button>
    </form>
  );
}
