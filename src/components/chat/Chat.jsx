import React, { useEffect, useRef, useState } from 'react'
import "./chat.css";
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
import { format } from "timeago.js";

const Chat = () => {

  const [chat, setChat] = useState()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [img, setImg] = useState({
    file: null,
    url : ""
  });

  const { chatId , user , isCurrentUserBlocked, isReceiverBlocked,} = useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    })

    return () => {
      unSub();
    }
  }, [chatId])

  // console.log(chat);
  
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  }

  const handleImg = (e) => {
      if (e.target.files[0]) {
          // Run only if there is an image uploaded:
          setImg({
              // Set the first image as avatar or dp or pp:
              file: e.target.files[0],
              // Creating an object url for fast display before label text:
              url : URL.createObjectURL(e.target.files[0])
          })  
      }
  }

  const handleSend = async () => {
    if (text === "") {
      return;
    }

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }


      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnapshot = await getDoc(chatDocRef);

      if (!chatDocSnapshot.exists()) {
        await setDoc(chatDocRef, { messages: [] });
      }

      await updateDoc(chatDocRef, {
        messages: arrayUnion({
          senderId: currentUser?.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && {img:imgUrl}),
        })
      });

      const userIDs = [currentUser?.id, user?.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot?.exists()) {
          const userChatsData = userChatsSnapshot?.data();
          
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c?.chatId === chatId
          );
          
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
            
            await updateDoc(userChatsRef, {
              chats: userChatsData?.chats,
            });
          }
        }
      });
    } catch (err) {
      console.log(err);
    }

    setImg({
      file: null,
      url: ""
    });

    setText("");
  }

  return (
    <div className='chat'>
      <div className='top'>
        <div className='user'>
          <img src={user?.avatar || './avatar.png'} alt='dp' />
          <div className='desc'>
            <span>{user?.username}</span>
            <p>Hey There, I am Using AbhiChat!</p>
          </div>
        </div>
        <div className='icons'>
          <img src='./phone.png' alt='phone' />
          <img src='./video.png' alt='video' />
          <img src='./info.png' alt='info' />
        </div>
      </div>

      <div className='center'>
        {chat?.messages?.map((message) => (
          <div
            className={message.senderId === currentUser?.id
              ? 'message own'
              : 'message'
            }
            key={message?.createAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              <span>{format(message.createdAt.toDate())}</span>
            </div>
          </div>
        ))}
        {img.url && <div className='message own'>
          <div className='texts'>
            <img src={img.url } />
          </div>
        </div>}
        <div ref={endRef}></div>
      </div>

      <div className='bottom'>
        <div className='icons'>
          <label htmlFor='file'>
            <img src='./img.png' alt='img' />
          </label>
          <input type='file' id='file' style={{display:'none'}} onChange={handleImg}/>
          <img src='./camera.png' alt='camera'/>
          <img src='./mic.png' alt='mic'/>
        </div>
        <input
          type='text'
          placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? 'You cannot write a message' :'Type a Message...'} 
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
        <div className='emoji'>
          <img
            src='./emoji.png'
            onClick={() => setOpen((prev) => !prev)}
            alt='emoji' 
          />
          <div className='picker'>
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className='sendButton'
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}>
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
