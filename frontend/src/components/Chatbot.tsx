import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import type { ChatMessage, ChatRequest, ChatResponse } from '../types';

// Try to use the Markdown component from chat-ui if available
let MarkdownComponent: React.ComponentType<{ content: string }> | null = null;
try {
    const { Markdown } = require('@llamaindex/chat-ui');
    MarkdownComponent = Markdown;
} catch (error) {
    console.log('Chat-ui Markdown component not available, using fallback');
}

// Enhanced Message Component with better markdown support
const MessageDisplay: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const renderAIMessage = (content: string) => {
        // If we have the chat-ui Markdown component, use it
        if (MarkdownComponent) {
            return <MarkdownComponent content={content} />;
        }
        
        // Enhanced fallback with better formatting
        const processedContent = content
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            // Italic text
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (code) => {
                return `<pre class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 my-2 overflow-x-auto">
                    <code class="text-sm font-mono text-gray-800 dark:text-gray-200">${code.trim()}</code>
                </pre>`;
            })
            // Highlight Indian Rupee amounts
            .replace(/₹(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '<span class="font-semibold text-green-600 dark:text-green-400">₹$1</span>')
            // Bullet points
            .replace(/^• (.+)$/gm, '<div class="flex items-start my-1"><span class="text-blue-500 mr-2">•</span><span>$1</span></div>')
            // Headers (simple # support)
            .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-2 text-gray-800 dark:text-gray-200">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-3 mb-2 text-gray-800 dark:text-gray-200">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-3 mb-2 text-gray-800 dark:text-gray-200">$1</h1>')
            // Line breaks
            .replace(/\n/g, '<br>');

        return (
            <div 
                className="text-sm prose prose-sm max-w-none dark:prose-invert prose-gray"
                dangerouslySetInnerHTML={{ __html: processedContent }}
            />
        );
    };

    return (
        <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                    message.isUser
                        ? 'bg-blue-600 text-white rounded-br-none ml-8'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none mr-8'
                }`}
            >
                {message.isUser ? (
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                ) : (
                    <div className="llama-response">
                        {renderAIMessage(message.message)}
                    </div>
                )}
                <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </div>
        </div>
    );
};

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            message: `Hi! I'm your **Splitwise Assistant**. I can help you with:

• Check balances and expenses
• View group information
• Analyze spending patterns
• Get expense summaries

What would you like to know about your expenses?`,
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            message: inputMessage,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const chatRequest: ChatRequest = {
                message: inputMessage,
            };

            const response: ChatResponse = await apiService.sendChatMessage(chatRequest);

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                message: response.response,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                message: `Sorry, I encountered an error processing your request. Please try again.

**Error details:** Connection issue with the AI service.`,
                isUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-105"
                    aria-label="Open chatbot"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-gradient-to-b from-gray-50 to-white border border-gray-300 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold">Splitwise Assistant</h3>
                    <p className="text-xs text-blue-100">Powered by Llama AI</p>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded hover:bg-blue-800"
                    aria-label="Close chatbot"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            {/* Messages - Enhanced with better styling */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map((message) => (
                    <MessageDisplay key={message.id} message={message} />
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none mr-8 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about expenses, balances, or groups..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 text-sm transition-colors duration-200 flex items-center justify-center min-w-[44px]"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot; 