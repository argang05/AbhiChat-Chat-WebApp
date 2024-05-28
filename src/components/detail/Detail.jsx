import React from 'react'
import "./detail.css";
import { auth, db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock , resetChat  } = useChatStore();

  const { currentUser } = useUserStore();


  const handleBlock = async () => {
    if (!user) {
      return;
    }

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user?.id) : arrayUnion(user?.id),
      })
      changeBlock()
    } catch (err) {
      console.log(err);
    }
  }

  const handleLogout = () => {
    auth.signOut();
    resetChat()
	};
  return (
    <div className='detail'>
      <div className='user'>
        <img src={user?.avatar || './avatar.png'} alt='dp' />
        <h2>{user?.username}</h2>
        <p>Hey There, I am Using AbhiChat!</p>
      </div>
      <div className='info'>
        <div className='option'>
          <div className='title'>
            <span>Chat Settings</span>
            <img src='./arrowUp.png' alt='arrowUp'/> 
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>Privacy & Help</span>
            <img src='./arrowUp.png' alt='arrowUp'/> 
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>Shared Photos</span>
            <img src='./arrowDown.png' alt='arrowUp'/> 
          </div>
          <div className='photos'>
            <div className='photoItem'>
              <div className='photoDetail'>
                <img src='https://images.pexels.com/photos/5210128/pexels-photo-5210128.jpeg?auto=compress&cs=tinysrgb&w=600' alt='img' />
                <span>photo_2024_2.png</span>
              </div>
              <img className='icons' src='./download.png' alt='download' />
            </div>
            <div className='photoItem'>
              <div className='photoDetail'>
                <img src='https://i.ytimg.com/vi/qH1GHq10E6k/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgVyhDMA8=&rs=AOn4CLCAljZzvPWbas12K0Y-eUKKSN-xdA' alt='img' />
                <span>photo_2024_2.png</span>
              </div>
              <img className='icons' src='./download.png' alt='download' />
            </div>
            <div className='photoItem'>
              <div className='photoDetail'>
                <img src='https://images.playground.com/63bc12749e4f4d9c904770751fe43242.jpeg' alt='img' />
                <span>photo_2024_2.png</span>
              </div>
              <img className='icons' src='./download.png' alt='download' />
            </div>
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>Shared Files</span>
            <img src='./arrowUp.png' alt='arrowUp'/> 
          </div>
        </div>
        <button onClick={handleBlock}>
          {
            isCurrentUserBlocked ?
              "You are Blocked!" :
            isReceiverBlocked ?
                "User Blocked!" :
                "Block User"
          }
        </button>
        <button className='logoutButton' onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Detail