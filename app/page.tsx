"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface AuthFormProps {
  redirectPath?: string;
}

export function AuthForm({ redirectPath = "/dashboard" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Redirect only on successful login
      router.push(redirectPath);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
