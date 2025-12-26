import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApp } from '@/context/AppContext';
import { chatWithDocument, getErrorMessage } from '@/services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  documentId: string;
  language: string;
}

// Function to parse markdown-like formatting and convert to styled text
const parseFormattedText = (text: string): React.ReactNode => {
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;

  // Replace **text** with bold
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  const matches: Array<{ start: number; end: number; text: string }> = [];

  while ((match = boldRegex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
  }

  matches.forEach((m, i) => {
    parts.push(text.slice(lastIndex, m.start));
    parts.push(
      <strong key={`bold-${i}`} className="font-semibold">
        {m.text}
      </strong>
    );
    lastIndex = m.end;
  });
  parts.push(text.slice(lastIndex));

  // Remove single asterisks from the entire result
  return parts.map((part, i) =>
    typeof part === 'string' ? (
      <React.Fragment key={`text-${i}`}>
        {part.replace(/\*/g, '')}
      </React.Fragment>
    ) : (
      part
    )
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentId, language }) => {
  const { showToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      showToast('error', 'Please enter a message');
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await chatWithDocument(documentId, input, language);

      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.result,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      showToast('error', getErrorMessage(error));
      // Remove the user message if there was an error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessageToClipboard = async (content: string, messageId: string) => {
    try {
      // Copy the cleaned text without asterisks
      const cleanedText = content.replace(/\*\*/g, '').replace(/\*/g, '');
      await navigator.clipboard.writeText(cleanedText);
      setCopiedId(messageId);
      showToast('success', 'Message copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('error', 'Failed to copy');
    }
  };

  return (
    <Card className="animate-slide-up flex flex-col h-full shadow-md border-0">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Ask Questions</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col overflow-hidden p-4">
        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto">
                  <MessageCircle className="w-7 h-7 text-blue-400 opacity-50" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Start the conversation</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Ask about clauses, terms, risks or get clarifications
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg group text-sm transition-all ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="break-words leading-relaxed whitespace-pre-wrap">
                      {message.role === 'assistant'
                        ? parseFormattedText(message.content)
                        : message.content}
                    </p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyMessageToClipboard(message.content, message.id)
                        }
                        className={`h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity p-0 ${
                          message.role === 'user'
                            ? 'hover:bg-blue-600'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {copiedId === message.id ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg rounded-bl-none">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-sm h-9"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
            className="shrink-0 bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
