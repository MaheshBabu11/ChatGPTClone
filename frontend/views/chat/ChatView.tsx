import {useState} from "react";
import {MessageList, MessageListItem} from "@hilla/react-components/MessageList";
import {MessageInput} from "@hilla/react-components/MessageInput";
import {AiService} from "Frontend/generated/endpoints";
import user from "Frontend/resources/user-profile.png"
import assistant from "Frontend/resources/virtual-assistant.png"

export default function ChatView() {
    const [messages, setMessages] = useState<MessageListItem[]>([]);

    async function sendMessage(message: string) {
        setMessages(messages => [...messages, {
            text: message,
            userName: 'You',
            time: new Date().toLocaleTimeString(),
            userImg: user,
            theme: 'current-user',
        }]);

        const response = await AiService.chat(message);
        setMessages(messages => [...messages, {
            text: response,
            userName: 'Assistant',
            userImg: assistant,
            time: new Date().toLocaleTimeString()
        }]);
    }

    return (
      <div className="p-m flex flex-col h-full box-border">
          <MessageList items={messages} className="flex-grow"/>
          <MessageInput onSubmit={e => sendMessage(e.detail.value)}/>
      </div>
    );
}
