import React from 'react';
import { ConversationCardProps } from '../types';

const ConversationCard: React.FC<ConversationCardProps> = ({ conversationObject, index, userName, aiName }) => {
  
  const getTurnInfo = (turn: string): { speaker: string; text: string; isUserTurn: boolean } => {
    const lowerTurn = turn.toLowerCase();
    const lowerUserName = userName.toLowerCase();
    const lowerAiName = aiName.toLowerCase();

    if (lowerTurn.startsWith(`${lowerUserName}:`)) {
      return { speaker: userName, text: turn.substring(userName.length + 1).trim(), isUserTurn: true };
    }
    if (lowerTurn.startsWith(`${lowerAiName}:`)) {
      return { speaker: aiName, text: turn.substring(aiName.length + 1).trim(), isUserTurn: false };
    }
    if (lowerTurn.startsWith("user:")) {
       return { speaker: userName, text: turn.substring("user:".length +1).trim(), isUserTurn: true };
    }
    if (lowerTurn.startsWith("iris:")) { // Handles old "IRIS:" prefix as a fallback
       return { speaker: aiName, text: turn.substring("iris:".length+1).trim(), isUserTurn: false };
    }
    // Basic fallback if no prefix. This assumes User starts (index 0).
    // This part might need refinement if prefixes are not guaranteed.
    const isLikelyUser = (turnIndexInConversation: number) => turnIndexInConversation % 2 === 0;
    const currentTurnIndexInConversation = conversationObject.conversation.findIndex(t => t === turn);

    return { 
        speaker: isLikelyUser(currentTurnIndexInConversation) ? userName : aiName, 
        text: turn, 
        isUserTurn: isLikelyUser(currentTurnIndexInConversation) 
    };
  };

  return (
    <div className="bg-white/75 backdrop-blur-sm shadow-lg rounded-xl p-4 sm:p-5 my-2 border border-amber-200 hover:shadow-amber-400/30 transition-shadow duration-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md sm:text-lg font-semibold text-amber-700">
          <span className="text-neutral-500 font-normal text-xs mr-1.5">#{index + 1}</span>
          {conversationObject.theme}
        </h3>
        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
          {conversationObject.conversation.length} turns
        </span>
      </div>
      <div className="space-y-2 max-h-72 sm:max-h-80 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100">
        {conversationObject.conversation.map((turnString, turnIndex) => {
          const { speaker, text, isUserTurn } = getTurnInfo(turnString);
          
          return (
            <div
              key={turnIndex}
              className={`flex ${isUserTurn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-2 sm:p-2.5 rounded-lg max-w-[85%] shadow-sm ${
                  isUserTurn
                    ? 'bg-sky-600 text-white rounded-br-none' // User bubble color
                    : 'bg-rose-100 text-neutral-700 rounded-bl-none' // AI bubble color, using a soft rose
                }`}
              >
                <span className={`font-bold text-xs ${isUserTurn ? 'text-sky-200' : 'text-rose-600'}`}>
                  {speaker}
                </span>
                <p className="text-sm mt-0.5 whitespace-pre-wrap">{text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationCard;