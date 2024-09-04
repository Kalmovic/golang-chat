import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { connect, sendMsg } from "./api";

type Message = {
  id: number;
  user: string;
  text: string;
  isSent: boolean;
};

const dummyNames = [
  "Wacky Walrus",
  "Silly Salamander",
  "Bumbling Bee",
  "Giggling Goblin",
  "Mystic Marshmallow",
  "Nifty Narwhal",
  "Quirky Quokka",
  "Jolly Jellyfish",
  "Fuzzy Fandango",
  "Zany Zebra",
  "Prancing Pegasus",
  "Loony Llama",
  "Snazzy Sasquatch",
  "Dapper Dragon",
  "Merry Mermaid",
  "Bizarre Banshee",
  "Whimsical Wizard",
  "Perky Penguin",
  "Kooky Kangaroo",
  "Vexing Vortex",
];

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [randomName, setRandomName] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connect((msg: MessageEvent) => {
      console.log("Message from websocket:", msg);
      const messageData = JSON.parse(msg.data);
      console.log("Message data:", messageData);
      const newMessage: Message = {
        id: Date.now(),
        user: messageData.user || "Anonymous",
        text: messageData.body,
        isSent: false,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  }, []);

  useEffect(() => {
    if (!userName && !isNameDialogOpen) {
      setIsNameDialogOpen(true);
    }
  }, [isNameDialogOpen, userName]);

  const storedName = localStorage.getItem("chatUserName");
  useEffect(() => {
    if (storedName) {
      setUserName(storedName);
      setIsNameDialogOpen(false);
    } else {
      const newRandomName =
        dummyNames[Math.floor(Math.random() * dummyNames.length)];
      setRandomName(newRandomName);
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() !== "") {
      sendMsg({ user: userName, body: inputMessage });
      const newMessage: Message = {
        id: Date.now(),
        user: userName || randomName,
        text: inputMessage,
        isSent: true,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage("");
    }
  };

  const handleSetUserName = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = userName.trim() || randomName;
    setUserName(finalName);
    localStorage.setItem("chatUserName", finalName);
    setIsNameDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-[600px] mx-auto bg-[#f5f5f5] rounded-xl shadow-xl overflow-hidden">
      <div className="bg-[#007AFF] p-2 border-b">
        <h1 className="text-lg font-semibold text-center text-white">
          Group Chat
        </h1>
      </div>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((message, index) => {
          const showUser =
            index === 0 || messages[index - 1].user !== message.user;
          return message.user === "System" ? (
            <div
              key={message.id}
              className="text-center text-xs text-gray-400 rounded-full bg-gray-200 py-1 mb-4"
            >
              {message.user === storedName
                ? "You just entered the chat"
                : message.text}
            </div>
          ) : (
            <div
              key={message.id}
              className={`mb-2 ${message.isSent ? "text-right" : "text-left"}`}
            >
              {showUser && (
                <div
                  className={`text-xs text-gray-500 mb-1 ${
                    message.isSent ? "text-right" : "text-left"
                  }`}
                >
                  {message.user}
                </div>
              )}
              <div
                className={`inline-block px-4 py-2 rounded-2xl max-w-[70%] ${
                  message.isSent
                    ? "bg-[#007AFF] text-white rounded-br-sm"
                    : "bg-[#E5E5EA] text-black rounded-bl-sm"
                }`}
              >
                {message.text}
              </div>
            </div>
          );
        })}
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex gap-2 p-4 bg-white">
        <Input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Message"
          className="flex-grow rounded-full bg-[#E5E5EA]"
        />
        <Button
          type="submit"
          className="rounded-full bg-[#007AFF] hover:bg-[#0056b3]"
        >
          Send
        </Button>
      </form>

      <Dialog open={isNameDialogOpen} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Your Chat Name</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetUserName}>
            <p className="mb-4 text-sm text-gray-600">
              We've suggested a fun name for you, but feel free to change it!
            </p>
            <Input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={randomName}
              className="mb-4"
            />
            <DialogFooter>
              <Button type="submit" className="bg-[#007AFF] hover:bg-[#0056b3]">
                Set Name
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
