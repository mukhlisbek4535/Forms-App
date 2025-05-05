import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import { io } from "socket.io-client";

const TemplateView = () => {
  const { id } = useParams(); // /templates/:id
  const { token, user, loading: verifyingLoading } = useAuth(); // 🛠 Extract user too!!

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [socket, setSocket] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentError, setCommentError] = useState("");

  // Likes-related ##
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Fetch template info
  useEffect(() => {
    console.log(user, loading);
    if (verifyingLoading) return;
    if (!user) return;
    const fetchTemplate = async () => {
      try {
        const { data } = await axios.get(
          `https://forms-app-vff5.onrender.com/templates/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { data: refreshedTemplate } = await axios.get(
          `https://forms-app-vff5.onrender.com/templates/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTemplate(refreshedTemplate.template);
        setLikesCount(refreshedTemplate.template.likedBy.length);

        if (user && user.userId) {
          // ✅ check if user is available
          setHasLiked(data.template.likedBy.includes(user.userId));
        } else {
          setHasLiked(false); // or leave default
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch template. You may not have permission."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTemplate();
  }, [id, token, user, verifyingLoading]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const { data } = await axios.get(
          `https://forms-app-vff5.onrender.com/templates/${id}/comments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setComments(data.message);
      } catch (err) {
        console.error(err);
        setCommentError("Failed to load comments.");
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [id, token]);

  // Setup Socket connection
  useEffect(() => {
    const newSocket = io("https://forms-app-vff5.onrender.com");
    setSocket(newSocket);

    newSocket.emit("join-room", id);

    newSocket.on("new-comment", (comment) => {
      setComments((prev) => [...prev, comment]);
    });

    newSocket.on("template-liked", ({ templateId, likesCount }) => {
      if (templateId === id) {
        setLikesCount(likesCount);
      }
    });

    newSocket.on("new-response", ({ templateId }) => {
      if (templateId === id) {
        setTemplate((prev) => ({
          ...prev,
          responseCount: prev.responseCount + 1,
        }));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  const handleLikeToggle = async () => {
    if (!user) {
      alert("You must be logged in to like a template.");
      return;
    }
    try {
      const { data } = await axios.post(
        `https://forms-app-vff5.onrender.com/templates/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHasLiked((prev) => !prev);
      setLikesCount(data.likesCount);
    } catch (err) {
      console.error(err);
      alert("Failed to like/unlike template.");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post(
        `https://forms-app-vff5.onrender.com/templates/${id}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewComment("");
    } catch (err) {
      console.error(err);
      setCommentError("Failed to submit comment.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading template...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">
        {template.title}
      </h1>
      {template.description && (
        <p className="text-gray-700 mb-2">{template.description}</p>
      )}
      <p className="text-sm text-gray-500 mb-4">
        Topic: <span className="italic">{template.topic.name || "N/A"}</span>
      </p>

      {/* ❤️ Likes */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={handleLikeToggle} className="text-red-500 text-xl">
          {hasLiked ? "❤️" : "🤍"}
        </button>
        <span className="text-gray-600">{likesCount} Likes</span>
      </div>

      {/* 🔥 Questions List */}
      <div className="space-y-6">
        {template.questions.map((q, index) => (
          <div key={index} className="border p-4 rounded bg-gray-50">
            <p className="font-semibold text-gray-800 mb-2">
              {index + 1}. {q.questionText}
            </p>

            {q.questionType === "single-line" && (
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                placeholder="Short answer"
                disabled
              />
            )}
            {q.questionType === "multi-line" && (
              <textarea
                className="w-full border px-3 py-2 rounded"
                rows={3}
                placeholder="Long answer"
                disabled
              />
            )}
            {q.questionType === "number" && (
              <input
                type="number"
                className="w-full border px-3 py-2 rounded"
                placeholder="Number"
                disabled
              />
            )}
            {q.questionType === "checkbox" && (
              <div className="space-y-1">
                {q.options?.map((option, i) => (
                  <label key={i} className="block">
                    <input type="checkbox" disabled className="mr-2" />
                    {option}
                  </label>
                ))}
              </div>
            )}
            {q.questionType === "dropdown" && (
              <select className="w-full border px-3 py-2 rounded" disabled>
                <option>Select an option</option>
                {q.options?.map((option, i) => (
                  <option key={i}>{option}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {/* 🔙 Back Link */}
      <div className="mt-6 flex justify-between">
        <Link
          to="/templates"
          className="text-blue-600 hover:underline font-medium"
        >
          ← Back to Templates
        </Link>
      </div>

      {/* 💬 Comments Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Comments</h2>

        {loadingComments ? (
          <p>Loading comments...</p>
        ) : commentError ? (
          <p className="text-red-500">{commentError}</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="p-3 border rounded bg-gray-50">
                <p className="text-sm text-gray-800 mb-1">{comment.content}</p>
                <p className="text-xs text-gray-500">
                  — {comment.author?.name || "Anonymous"}{" "}
                  {dayjs(comment.createdAt).format("MMM D, YYYY h:mm A")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="flex mt-6 gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default TemplateView;
