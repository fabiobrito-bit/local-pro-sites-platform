import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Send, Bot, User } from 'lucide-react';

export default function ClientChat() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => api.getChatSessions(),
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: () => sessionId ? api.getChatMessages(sessionId) : Promise.resolve([]),
    enabled: !!sessionId,
  });

  const createSessionMutation = useMutation({
    mutationFn: () => api.createChatSession(),
    onSuccess: (data) => {
      setSessionId(data.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (msg: string) => api.sendMessage(sessionId!, msg),
    onSuccess: () => {
      refetchMessages();
      setMessage('');
    },
  });

  useEffect(() => {
    if (sessions && sessions.length > 0 && !sessionId) {
      setSessionId(sessions[0].id);
    }
  }, [sessions, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !sessionId) return;
    sendMessageMutation.mutate(message);
  };

  const handleNewChat = () => {
    createSessionMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Chat Assistent</h1>
          <p className="text-muted-foreground mt-1">
            Stel vragen of vraag wijzigingen voor je website
          </p>
        </div>
        <Button onClick={handleNewChat}>Nieuwe Chat</Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Chat Sessions Sidebar */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Gesprekken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sessions?.map((session: any) => (
              <button
                key={session.id}
                onClick={() => setSessionId(session.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  sessionId === session.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <p className="font-medium truncate">{session.title}</p>
                <p className="text-xs opacity-70 truncate">
                  {new Date(session.createdAt).toLocaleDateString('nl-NL')}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="col-span-3 flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {!messages || messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start een gesprek met de AI assistent</p>
                  <p className="text-sm mt-2">
                    Stel vragen of vraag wijzigingen voor je website
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString('nl-NL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Typ je bericht..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!sessionId || sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                disabled={!message.trim() || !sessionId || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
