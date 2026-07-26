import { ConversationView } from "@/features/conversation/components/conversation-view";
import { generateId } from "ai";

const NewNotebookPage = async () => {
  // Generate a temporary ID — not saved until first message is sent
  const id = generateId();

  return (
    <ConversationView
      key={id}
      conversationId={id}
      initialMessages={[]}
    />
  );
};

export default NewNotebookPage;
