import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useState } from "react";
import NotificationCommentField from "./notification-comment-field.component";
import { useContext } from "react";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCard = ({ data, index, notificationState }) => {
  let [isReplying, setIsReplying] = useState(false);
  let {
    seen,
    type,
    reply,
    replied_on_comment,
    comment,
    user,
    user: { personal_info: { profile_img, fullname, username } } = {},
    blog: { _id, blog_id, title },
    createdAt,
    _id: notification_id,
  } = data;

  let {
    userAuth: {
      username: author_username,
      profile_img: author_profile_img,
      access_token,
    } = {},
  } = useContext(UserContext);

  let {
    notifications,
    notifications: { results, totalDocs },
    setNotifications,
  } = notificationState;

  const handleReplyClick = () => {
    setIsReplying((preVal) => !preVal);
  };

  const handleDelete = (comment_id, type, target) => {
    target.setAttribute("disabled", true);
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        { _id: comment_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        if (type == "comment") {
          results.splice(index, 1);
        } else {
          delete results[index].reply;
        }

        target.removeAttribute("disabled");
        setNotifications({
          ...notifications,
          results,
          totalDocs: totalDocs - 1,
          deletedDocCount: notifications.deletedDocCount + 1,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div
      className={
        "p-6 border-b border-dark-grey/30 border-l-black " +
        (!seen ? "border-l-2" : "")
      }
    >
      <div className="flex gap-5 mb-3">
        <img src={profile_img} className="w-14 h-14 flex-none rounded-full" />
        <div className="w-full">
          <h1 className="font-medium text-xl text-dark-grey">
            <span className="capitalize lg:inline-block hidden ">
              {fullname}
            </span>
            <Link
              to={`/user/${username}`}
              className="mx-2 text-black underline"
            >
              @{username}
            </Link>
            <span className="font-normal">
              {type == "like"
                ? "liked your blog"
                : type == "comment"
                ? "commented on"
                : "replied on "}
            </span>
          </h1>
          {type == "reply" ? (
            <div className="p-4 mt-4 rounded-md bg-grey">
              <p>{replied_on_comment.comment}</p>
            </div>
          ) : (
            <Link
              to={`/blog/${blog_id}`}
              className="font-medium text-dark-grey hover:underline line-clamp-1 "
            >
              {`"${title}"`}
            </Link>
          )}
        </div>
      </div>

      {type != "like" ? (
        <p className="ml-14 pl-5 font-gelasio text-xl">{comment.comment}</p>
      ) : (
        ""
      )}

      <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-7">
        <p>{getDay(createdAt)}</p>

        {type != "like" ? (
          <>
            {!reply ? (
              <button
                className="underline hover:text-black"
                onClick={handleReplyClick}
              >
                Reply
              </button>
            ) : (
              ""
            )}
            <button
              className="underline hover:text-black text-red"
              onClick={(e) => handleDelete(comment._id, "comment", e.target)}
            >
              Delete
            </button>
          </>
        ) : (
          ""
        )}
      </div>

      {isReplying ? (
        <div className="mt-6">
          <NotificationCommentField
            _id={_id}
            blog_author={user}
            index={index}
            replyingTo={comment._id}
            setIsReplying={setIsReplying}
            notification_id={notification_id}
            notificationData={notificationState}
          />
        </div>
      ) : (
        ""
      )}

      {reply ? (
        <div className="ml-20 p-5 bg-grey mt-3 rounded-md">
          <div className="flex gap-3 mb-2">
            <img src={author_profile_img} className="w-8 h-8 rounded-full" />

            <div>
              <h1 className="font-medium text-xl text-dark-grey">
                <Link
                  to={`/user/${author_username}`}
                  className="mx-1 text-black underline"
                >
                  @{author_username}
                </Link>

                <span className="font-normal">replied to</span>

                <Link
                  to={`/user/${username}`}
                  className="mx-1 text-black underline"
                >
                  @{username}
                </Link>
              </h1>
            </div>
          </div>

          <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>

          {/* <button
            className="underline hover:text-black ml-14 mt-2"
            onClick={(e) => handleDelete(comment._id, "reply", e.target)}
          >
            Delete
          </button> */}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default NotificationCard;
