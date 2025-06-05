
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Send, Users, Plus, Hash } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import AnimatedTransition from '../components/AnimatedTransition';
import CreateRoomDialog from '../components/CreateRoomDialog';

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  member_count?: number;
}

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadUserRooms();
    }
  }, [user]);

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom.id);
      subscribeToMessages(activeRoom.id);
    }
  }, [activeRoom]);

  const loadUserRooms = async () => {
    try {
      const { data: roomsData, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_room_members(count)
        `);

      if (error) throw error;

      const roomsWithCount = roomsData?.map(room => ({
        ...room,
        member_count: room.chat_room_members?.[0]?.count || 0
      })) || [];

      setRooms(roomsWithCount);

      // Auto-select first room if available
      if (roomsWithCount.length > 0 && !activeRoom) {
        setActiveRoom(roomsWithCount[0]);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast({
        title: "Error loading chat rooms",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles(name, avatar)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const messagesWithUser = messagesData?.map(msg => ({
        ...msg,
        user_name: msg.profiles?.name || 'Unknown User',
        user_avatar: msg.profiles?.avatar
      })) || [];

      setMessages(messagesWithUser);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = (roomId: string) => {
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Get user info for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar')
            .eq('id', newMessage.user_id)
            .single();

          const messageWithUser = {
            ...newMessage,
            user_name: profile?.name || 'Unknown User',
            user_avatar: profile?.avatar
          };

          setMessages(prev => [...prev, messageWithUser]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            room_id: activeRoom.id,
            user_id: user.id,
            content: newMessage.trim()
          }
        ]);

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_room_members')
        .insert([
          {
            room_id: roomId,
            user_id: user.id
          }
        ]);

      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }

      loadUserRooms();
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <AnimatedTransition>
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access chat</h1>
          <p className="text-gray-400">You need to be authenticated to participate in chat rooms.</p>
        </div>
      </AnimatedTransition>
    );
  }

  return (
    <AnimatedTransition>
      <div className="container mx-auto py-6 px-4 h-[calc(100vh-4rem)]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Chat</h1>
          <div className="text-2xl font-bold tracking-tighter idxf-logo">IDXF</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
          {/* Rooms Sidebar */}
          <Card className="md:col-span-1 bg-idxf-black border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Chat Rooms</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateRoomOpen(true)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 p-4 pt-0">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeRoom?.id === room.id
                          ? 'bg-idxf-lime text-idxf-black'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setActiveRoom(room)}
                    >
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4" />
                        <span className="font-medium">{room.name}</span>
                      </div>
                      {room.description && (
                        <p className="text-xs opacity-70 mt-1">{room.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span className="text-xs">{room.member_count || 0}</span>
                        </div>
                        {room.is_private && (
                          <Badge variant="secondary" className="text-xs">Private</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-3 bg-idxf-black border-white/10 flex flex-col">
            {activeRoom ? (
              <>
                <CardHeader className="pb-3 border-b border-white/10">
                  <CardTitle className="flex items-center space-x-2">
                    <Hash className="h-5 w-5" />
                    <span>{activeRoom.name}</span>
                  </CardTitle>
                  {activeRoom.description && (
                    <p className="text-sm text-gray-400">{activeRoom.description}</p>
                  )}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.user_avatar} />
                            <AvatarFallback className="bg-idxf-lime text-idxf-black text-xs">
                              {message.user_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{message.user_name}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Message #${activeRoom.name}`}
                        className="flex-1 bg-white/5 border-white/10"
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Hash className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Select a chat room</h3>
                  <p className="text-gray-400">Choose a room from the sidebar to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <CreateRoomDialog
          open={isCreateRoomOpen}
          onOpenChange={setIsCreateRoomOpen}
          onRoomCreated={loadUserRooms}
        />
      </div>
    </AnimatedTransition>
  );
};

export default Chat;
