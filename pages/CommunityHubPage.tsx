
import React, { useState } from 'react';
import { COMMUNITY_POSTS, COMMUNITY_EVENTS } from '../constants';
import { CommunityPost, CommunityEvent, Comment, UserDetails } from '../types';
import { HeartIcon, ChatBubbleIcon, CalendarIcon, MapPinIcon, SmallUsersIcon, MicroHeartIcon, MicroChatBubbleIcon, PhotoIcon, VideoCameraIcon, XCircleIcon, EllipsisHorizontalIcon } from '../components/icons/Icons';
import CreateEventModal from '../components/CreateEventModal';
import MediaUploadModal from '../components/MediaUploadModal';

interface CommentProps {
    comment: Comment;
    onLike: (commentId: string) => void;
    onReply: (commentId: string, content: string) => void;
}

const CommentView: React.FC<CommentProps> = ({ comment, onLike, onReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        onReply(comment.id, replyContent);
        setReplyContent('');
        setIsReplying(false);
    };
    
    return (
        <div className="flex items-start space-x-3">
            <img src={comment.authorImageUrl} alt={comment.author} className="w-9 h-9 rounded-full mt-1 object-cover" />
            <div className="flex-1">
                <div className="bg-gray-100 rounded-xl p-3">
                    <p className="font-semibold text-gray-800 text-sm">{comment.author}</p>
                    <p className="text-gray-700">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1 pl-2">
                    <span className="font-semibold">{comment.timestamp}</span>
                    <button onClick={() => onLike(comment.id)} className="font-semibold hover:underline">Like</button>
                    <button onClick={() => setIsReplying(!isReplying)} className="font-semibold hover:underline">Reply</button>
                    {comment.likes > 0 && (
                        <div className="flex items-center text-red-500">
                           <MicroHeartIcon />
                           <span className="ml-1">{comment.likes}</span>
                        </div>
                    )}
                </div>

                {isReplying && (
                     <form onSubmit={handleReplySubmit} className="mt-2 flex space-x-2">
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Reply to ${comment.author}...`}
                            className="w-full border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                            autoFocus
                        />
                         <button type="submit" className="bg-teal-600 text-white font-bold px-4 rounded-full text-sm hover:bg-teal-700">Send</button>
                    </form>
                )}

                <div className="mt-2 space-y-2">
                    {comment.replies.map(reply => (
                        <CommentView key={reply.id} comment={reply} onLike={onLike} onReply={onReply} />
                    ))}
                </div>
            </div>
        </div>
    );
};

interface AddCommentFormProps {
    onSubmit: (content: string) => void;
    userProfilePicUrl: string;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({ onSubmit, userProfilePicUrl }) => {
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit(content);
        setContent('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-start space-x-3 pt-4">
            <img src={userProfilePicUrl} alt="Your avatar" className="w-9 h-9 rounded-full mt-1 object-cover" />
            <div className="flex-1">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full border border-gray-300 bg-gray-50 rounded-full px-4 py-2 text-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>
        </form>
    );
};

interface CommunityHubPageProps {
    userDetails: UserDetails;
}

const CommunityHubPage: React.FC<CommunityHubPageProps> = ({ userDetails }) => {
    const { name: userName, profilePicUrl } = userDetails;
    const [posts, setPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);
    const [events, setEvents] = useState<CommunityEvent[]>(COMMUNITY_EVENTS);
    const [newPostContent, setNewPostContent] = useState('');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [mediaToUpload, setMediaToUpload] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [mediaModalMode, setMediaModalMode] = useState<'image' | 'video'>('image');
    
    // State for editing posts
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [activePostMenu, setActivePostMenu] = useState<string | null>(null);


    const countComments = (comments: Comment[]): number => {
        return comments.reduce((acc, comment) => {
            return acc + 1 + countComments(comment.replies);
        }, 0);
    };
    
    const handleOpenMediaModal = (mode: 'image' | 'video') => {
        setMediaModalMode(mode);
        setIsMediaModalOpen(true);
    };
    
    const handleAttachMedia = (url: string, type: 'image' | 'video') => {
        setMediaToUpload({ url, type });
        setIsMediaModalOpen(false);
    };

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() && !mediaToUpload) return;

        const newPost: CommunityPost = {
            id: `post${Date.now()}`,
            author: userName,
            authorImageUrl: profilePicUrl,
            timestamp: 'Just now',
            content: newPostContent,
            likes: 0,
            comments: [],
            ...(mediaToUpload && { mediaUrl: mediaToUpload.url, mediaType: mediaToUpload.type }),
        };
        setPosts(currentPosts => [newPost, ...currentPosts]);
        setNewPostContent('');
        setMediaToUpload(null);
    };
    
    const handleAddEvent = (event: Omit<CommunityEvent, 'id' | 'attendees' | 'author'>) => {
        const newEvent: CommunityEvent = {
            ...event,
            id: `event${events.length + 1}`,
            attendees: 1,
            author: userName,
        };
        setEvents([newEvent, ...events]);
    };

    const handleLikePost = (postId: string) => {
        setPosts(currentPosts => currentPosts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    };

    const handleCommentUpdate = (postId: string, updateFn: (comments: Comment[]) => Comment[]) => {
         setPosts(currentPosts => 
            currentPosts.map(post => {
                if (post.id === postId) {
                    return { ...post, comments: updateFn(post.comments) };
                }
                return post;
            })
        );
    };
    
    const handleAddComment = (postId: string, content: string) => {
        const newComment: Comment = {
            id: `c${Date.now()}`,
            author: userName,
            authorImageUrl: profilePicUrl,
            timestamp: 'Just now',
            content,
            likes: 0,
            replies: [],
        };
        setPosts(currentPosts =>
            currentPosts.map(post =>
                post.id === postId
                    ? { ...post, comments: [...post.comments, newComment] }
                    : post
            )
        );
    };

    const handleLikeComment = (postId: string, commentId: string) => {
        const updateLikesRecursively = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
                if (comment.id === commentId) {
                    return { ...comment, likes: comment.likes + 1 };
                }
                if (comment.replies && comment.replies.length > 0) {
                    return { ...comment, replies: updateLikesRecursively(comment.replies) };
                }
                return comment;
            });
        };
        handleCommentUpdate(postId, updateLikesRecursively);
    };

    const handleAddReply = (postId: string, parentId: string, content: string) => {
        const newReply: Comment = {
            id: `c${Date.now()}`,
            author: userName,
            authorImageUrl: profilePicUrl,
            timestamp: 'Just now',
            content,
            likes: 0,
            replies: [],
        };

        const addReplyRecursively = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
                if (comment.id === parentId) {
                    return { ...comment, replies: [...comment.replies, newReply] };
                }
                if (comment.replies && comment.replies.length > 0) {
                    return { ...comment, replies: addReplyRecursively(comment.replies) };
                }
                return comment;
            });
        };
        handleCommentUpdate(postId, addReplyRecursively);
    };
    
    const handleStartEdit = (post: CommunityPost) => {
        setEditingPostId(post.id);
        setEditedContent(post.content);
        setActivePostMenu(null);
    };

    const handleCancelEdit = () => {
        setEditingPostId(null);
        setEditedContent('');
    };

    const handleSaveEdit = (postId: string) => {
        if (!editedContent.trim()) return;
        setPosts(currentPosts => currentPosts.map(p => 
            p.id === postId 
            ? { ...p, content: editedContent, edited: true, timestamp: 'Just now' } 
            : p
        ));
        handleCancelEdit();
    };

    return (
        <div>
            <header className="mb-10">
                <h2 className="text-5xl font-bold text-gray-800">Community Hub</h2>
                <p className="text-2xl text-gray-500 mt-2">Connect, share, and engage with your peers.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Community Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <form onSubmit={handlePostSubmit}>
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="w-full h-24 p-3 border-2 border-gray-200 rounded-lg text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                placeholder={`What's on your mind, ${userName}?`}
                            />
                             {mediaToUpload && (
                                <div className="mt-4 relative group">
                                    {mediaToUpload.type === 'image' ? (
                                        <img src={mediaToUpload.url} alt="Upload preview" className="rounded-lg max-h-60 w-auto" />
                                    ) : (
                                        <video src={mediaToUpload.url} controls className="rounded-lg max-h-60 w-auto" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setMediaToUpload(null)}
                                        className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Remove media"
                                    >
                                        <XCircleIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center space-x-2">
                                    <button type="button" onClick={() => handleOpenMediaModal('image')} className="flex items-center text-gray-600 hover:text-teal-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                        <PhotoIcon className="h-6 w-6" /> <span className="ml-2 hidden sm:inline">Add Photo</span>
                                    </button>
                                    <button type="button" onClick={() => handleOpenMediaModal('video')} className="flex items-center text-gray-600 hover:text-teal-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                        <VideoCameraIcon className="h-6 w-6" /> <span className="ml-2 hidden sm:inline">Add Video</span>
                                    </button>
                                </div>
                                <button type="submit" className="bg-teal-600 text-white font-bold py-2 px-6 rounded-full text-lg hover:bg-teal-700 disabled:bg-gray-300" disabled={!newPostContent.trim() && !mediaToUpload}>Post</button>
                            </div>
                        </form>
                    </div>

                    {posts.map(post => (
                        <div key={post.id} className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-start space-x-4">
                                <img src={post.authorImageUrl} alt={post.author} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-gray-800">{post.author}</p>
                                    <p className="text-sm text-gray-500">{post.timestamp} {post.edited && <span className="italic">(edited)</span>}</p>
                                </div>
                                {post.author === userName && editingPostId !== post.id && (
                                    <div className="relative">
                                        <button onClick={() => setActivePostMenu(activePostMenu === post.id ? null : post.id)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                            <EllipsisHorizontalIcon className="h-6 w-6" />
                                        </button>
                                        {activePostMenu === post.id && (
                                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10">
                                                <button onClick={() => handleStartEdit(post)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</button>
                                                {/* Future: <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</button> */}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {editingPostId === post.id ? (
                                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(post.id); }} className="mt-4">
                                    <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="w-full h-24 p-3 border-2 border-gray-200 rounded-lg text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        autoFocus
                                    />
                                    <div className="flex justify-end items-center mt-2 space-x-2">
                                        <button type="button" onClick={handleCancelEdit} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                                        <button type="submit" className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700">Save</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {post.content && <p className="mt-4 text-lg text-gray-700 whitespace-pre-wrap">{post.content}</p>}

                                    {post.mediaUrl && (
                                        <div className="mt-4 rounded-lg overflow-hidden border">
                                            {post.mediaType === 'image' ? (
                                                <img src={post.mediaUrl} alt="Post content" className="w-full object-cover" />
                                            ) : (
                                                <video src={post.mediaUrl} controls className="w-full bg-black" />
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-4 pt-3 border-t flex items-center space-x-6 text-gray-600">
                                        <button onClick={() => handleLikePost(post.id)} className="flex items-center font-semibold hover:text-red-500">
                                            <HeartIcon /> <span className="ml-2">{post.likes} Likes</span>
                                        </button>
                                        <div className="flex items-center font-semibold">
                                            <ChatBubbleIcon /> <span className="ml-2">{countComments(post.comments)} Comments</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {post.comments.map(comment => (
                                            <CommentView key={comment.id} comment={comment} onLike={(commentId) => handleLikeComment(post.id, commentId)} onReply={(parentId, content) => handleAddReply(post.id, parentId, content)} />
                                        ))}
                                    </div>
                                    <AddCommentForm onSubmit={(content) => handleAddComment(post.id, content)} userProfilePicUrl={profilePicUrl} />
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right Sidebar: Events */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-800">Upcoming Events</h3>
                            <button onClick={() => setIsEventModalOpen(true)} className="bg-teal-100 text-teal-700 font-bold px-4 py-2 rounded-lg text-sm hover:bg-teal-200">Create Event</button>
                        </div>
                        <div className="space-y-4">
                            {events.map(event => (
                                <div key={event.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="font-bold text-lg text-teal-700">{event.title}</p>
                                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                                        <p className="flex items-center"><CalendarIcon /> <span className="ml-2">{event.date} at {event.time}</span></p>
                                        <p className="flex items-center"><MapPinIcon /> <span className="ml-2">{event.location}</span></p>
                                        <p className="flex items-center"><SmallUsersIcon /> <span className="ml-2">{event.attendees} going</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <CreateEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onAddEvent={handleAddEvent} />
            <MediaUploadModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onAttachMedia={handleAttachMedia}
                mode={mediaModalMode}
            />
        </div>
    );
};

export default CommunityHubPage;
