"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const prompts = [
  "Should we hire now?",
  "Which product line is most profitable?",
  "When do we hit break-even?",
];

export function AdvisorChat({
  organizationId,
  remainingMessages,
}: {
  organizationId: string;
  remainingMessages: number | "fair-use";
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const remainingLabel = useMemo(
    () =>
      remainingMessages === "fair-use"
        ? "Fair-use messages"
        : `${remainingMessages} messages left this month`,
    [remainingMessages],
  );

  async function sendMessage(prompt?: string) {
    const value = prompt ?? input;
    if (!value.trim() || loading) {
      return;
    }

    setLoading(true);
    setInput("");

    const nextMessages = [...messages, { role: "user", content: value } as ChatMessage];
    setMessages(nextMessages);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId,
        messages: nextMessages,
      }),
    });

    if (!response.ok || !response.body) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I could not process your request right now." },
      ]);
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) {
        break;
      }
      assistantText += decoder.decode(chunk, { stream: true });
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.role === "assistant") {
          copy[copy.length - 1] = { ...last, content: assistantText };
        }
        return copy;
      });
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Advisor</CardTitle>
        <p className="text-sm text-muted-foreground">{remainingLabel}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <Button key={prompt} variant="outline" size="sm" onClick={() => sendMessage(prompt)}>
              {prompt}
            </Button>
          ))}
        </div>

        <div className="min-h-[360px] space-y-3 rounded-xl border border-border bg-muted/30 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ask a financial question to start.</p>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-white text-foreground"
                }`}
              >
                {message.content}
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask the AI CFO..."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void sendMessage();
              }
            }}
          />
          <Button disabled={loading || !input.trim()} onClick={() => sendMessage()}>
            {loading ? "..." : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
