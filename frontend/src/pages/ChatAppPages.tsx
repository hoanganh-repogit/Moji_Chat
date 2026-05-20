import React from "react";
import Logout from "@/components/auth/Logout";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";
const ChatAppPages = () => {
  const user = useAuthStore((s) => s.user);

  const handleOnClick = async () => {
    try {
      await api.get("/users/test", { withCredentials: true });
      toast.success("Test endpoint is working!");
    } catch (error) {
      console.error("Error fetching test endpoint:", error);
      toast.error("Failed to fetch test endpoint. Please try again.");
    }
  };

  return (
    <div>
      {user?.username}
      <Logout />

      <Button onClick={handleOnClick}>test</Button>
    </div>
  );
};

export default ChatAppPages;
