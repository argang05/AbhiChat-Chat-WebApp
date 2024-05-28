import React, { useEffect, useState } from 'react'
import "./chatList.css";
import AddUser from './addUser/AddUser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const [input, setInput] = useState("");

    const { currentUser } = useUserStore();
    const { chatId , changeChat } = useChatStore();

      useEffect(() => {
            const unSub = onSnapshot(
            doc(db, "userchats", currentUser.id),
            async (res) => {
                const items = res.data().chats;

                const promises = items.map(async (item) => {
                    const userDocRef = doc(db, "users", item.receivedId);
                    const userDocSnap = await getDoc(userDocRef);

                    const user = userDocSnap.data();

                    return { ...item, user };
                });

                const chatData = await Promise.all(promises);

                setChats(chatData.sort((a, b) => a.updatedAt - b.updatedAt));
            }
            );

            return () => {
            unSub();
            };
        }, [currentUser.id]);
    
    // console.log(chats);

    const handleSelect = async (chat) => {
        const userChats = chats.map(item => {
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId);

        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {
            await updateDoc(userChatsRef, {
                chats : userChats,
            })
            changeChat(chat.chatId, chat.user);
        } catch (err) {
            console.log(err);
        }

    }

    const filteredChats = chats?.filter(
        c => c.user?.username.toLowerCase().includes(input.toLowerCase())
    )

  return (
      <div className='chatlist'>
          <div className='search'>
              <div className='searchBar'>
                  <img src='./search.png' alt='search' />
                  <input
                      type='text'
                      placeholder='Search...' 
                      onChange={(e) => setInput(e.target.value)}
                      />
              </div>
              <img
                  onClick={()=> setAddMode((prev) => !prev)}
                  className='add'
                  src={addMode ? "./minus.png" : "./plus.png"}
                  alt='plus/minus' />
          </div>
          {filteredChats.map(chat => (        
              <div
                  className='item'
                  key={chat.chatId}
                  onClick={() => handleSelect(chat)}
                  style={{
                      backgroundColor : chat?.isSeen ? "transparent" : "#5183fe",
                  }}
              >
                  <img src={
                      chat?.user.blocked.includes(currentUser?.id) ?
                          "./avatar.png"
                          :
                      chat.user.avatar || "./avatar.png"
                  }
                      alt='dp' />
                    <div className='texts'>
                      <span>
                          {
                              chat?.user.blocked.includes(currentUser?.id) ?
                                  "User"
                                  :
                                  chat?.user.username
                          }
                      </span>
                        <p>{chat?.lastMessage}</p>
                    </div>
                </div>
          ))}
          {addMode && <AddUser/>}
    </div>
  )
}

export default ChatList