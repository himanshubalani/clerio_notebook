import { ConversationView } from "@/features/conversation/components/conversation-view";
import { generateId } from "ai";

/**
 * New notebook page — generates a temporary ID until the first message is sent.
 */
const NewNotebookPage = async () => {
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
