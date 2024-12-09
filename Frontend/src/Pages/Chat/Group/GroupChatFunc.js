// USER ACTIONS
export const handleOnlineGroupUsers = (users, setOnlineGroupUsers) => {
  const { groupId, onlineUsers } = users;
  setOnlineGroupUsers((prev) => {
    return {
      ...prev,
      [groupId.toString()]: onlineUsers,
    };
  });
};

export const AddedToGroup = (data, setGroups) => {
  console.log("Data passed to AddedToGroup:", data);
  const undeliveredCount = data?.undeliveredCount || 0;

  const newObj = {
    ...data.group,
    latestMessage: data?.latestMessage,
    undeliveredCount,
  };
  setGroups((prevGroups) => {
    return [...prevGroups, newObj];
  });
};

export const newGroupNotification = (data, setGroups) => {
  setGroups((prevGroups) =>
    prevGroups.map((group) => {
      if (group?._id?.toString() === data?.groupId?.toString()) {
        return {
          ...group,
          latestMessage: {
            message: data?.latestMessage?.message,
            createdAt: data?.latestMessage?.createdAt,
            senderId: data?.latestMessage?.senderId,
            senderName: data?.latestMessage?.senderName,
            isNotification: data?.latestMessage?.isNotification,
          },
          undeliveredCount: (group?.undeliveredCount || 0) + 1,
        };
      }
      return group;
    })
  );
};

export const newGroupMessage = (data, setMessages) => {
  const { message } = data;
  setMessages((prev) => [...prev, message]);
};
