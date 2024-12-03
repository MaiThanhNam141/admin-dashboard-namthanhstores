import React, { useState, useEffect, FormEvent } from "react";
import { realtimeDatabase } from "../firebase/config";
import { ref, onValue, push } from "firebase/database";

const SupporterChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const conversationsRef = ref(realtimeDatabase, "conversations");
    onValue(conversationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedConversations = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setConversations(formattedConversations);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const messagesRef = ref(realtimeDatabase, `conversations/${selectedConversation.id}/messages`);
      onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const formattedMessages = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setMessages(formattedMessages);
        }
      });
    }
  }, [selectedConversation]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const messageData = {
      text: newMessage,
      sender: "Supporter",
      timestamp: Date.now(),
    };

    const messagesRef = ref(realtimeDatabase, `conversations/${selectedConversation.id}/messages`);
    push(messagesRef, messageData);
    setNewMessage("");
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
    }}>
      <div style={{
        width: '30%',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        padding: '20px',
      }}>
        <h3 style={{
          fontSize: '18px',
          marginBottom: '20px',
          color: '#2c3e50',
        }}>Danh sách hội thoại</h3>
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            style={{
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: selectedConversation?.id === conversation.id ? '#3498db' : '#f1f1f1',
              color: selectedConversation?.id === conversation.id ? 'white' : '#333',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onClick={() => setSelectedConversation(conversation)}
          >
            <p style={{ margin: 0 }}>{conversation.customerName || "Khách hàng không xác định"}</p>
          </div>
        ))}
      </div>

      <div style={{
        width: '70%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {selectedConversation ? (
          <>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e0e0e0',
            }}>
              <h3 style={{
                fontSize: '18px',
                margin: 0,
                color: '#2c3e50',
              }}>Hội thoại với: {selectedConversation.customerName || "Khách hàng"}</h3>
            </div>
            <div style={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === "Supporter" ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.sender === "Supporter" ? '#3498db' : '#e74c3c',
                    color: 'white',
                    borderRadius: '20px',
                    padding: '10px 15px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  <span style={{
                    fontSize: '12px',
                    opacity: 0.7,
                    marginTop: '5px',
                    display: 'block',
                  }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} style={{
              padding: '20px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                style={{
                  flexGrow: 1,
                  padding: '10px',
                  borderRadius: '20px',
                  border: '1px solid #e0e0e0',
                  marginRight: '10px',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                }}
              >
                Gửi
              </button>
            </form>
          </>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            fontSize: '18px',
            color: '#7f8c8d',
          }}>
            <p>Hãy chọn một cuộc hội thoại để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupporterChat;

