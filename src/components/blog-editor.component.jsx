import { Link, useNavigate, useParams } from "react-router-dom";
import darkLogo from "../imgs/logo-dark.png";
import lightLogo from "../imgs/logo-light.png";
import AnimationWrapper from "../common/page-animation";
import lightBlogBanner from "../imgs/blog banner.png"
import darkBlogBanner from "../imgs/blog banner dark.png"
import { uploadImage } from "../common/aws";
import { useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";

//importing tools
import { tools } from "./tools.component";
import axios from "axios";
import { ThemeContext, UserContext } from "../App";

const BlogEditor = () => {
  const {
    blog,
    blog: { title, banner, content, tags, des } = {},
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  // Check if blog is undefined before trying to access its properties
  if (!blog) {
    // Add your handling logic here, for example, you can return null or show a loading indicator.
    return null;
  }

  const { userAuth: { access_token } = {} } = useContext(UserContext);
  let { blog_id } = useParams();
  const navigate = useNavigate();

  let { theme } = useContext(ThemeContext);

  useEffect(() => {
    // if (!textEditor.isReady) {
    setTextEditor(
      new EditorJS({
        holderId: "textEditor",
        data: Array.isArray(content) ? content[0] : content,
        tools: tools,
        placeholder: "Let's write an awesome story!",
      })
    );
    // }
  }, []);

  const handleBannerUpload = (e) => {
    let img = e.target.files[0];

    if (img) {
      let loadingToast = toast.loading("Uploading...");

      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded sucessfully!");
            setBlog({ ...blog, banner: url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          return toast.error(err);
        });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      //user have pressed enter key
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;

    input.style.height = "auto";

    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  const handleImgUploadingError = (e) => {
    let img = e.target;
    img.src = theme == "light" ? lightBlogBanner : darkBlogBanner;
  };

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Upload a blog banner to publish!");
    }
    if (!title.length) {
      return toast.error("Write blog title to publsih!");
    }
    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write something to publish!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write blog title before saving it as a draft!");
    }

    let loadingToast = toast.loading("Saving as Draft...");

    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((data) => {
        let blogObj = {
          title,
          banner,
          des, // Assuming des, tags, and draft are defined somewhere in your code
          content: data.blocks, // Extracting the necessary information from the saved data
          tags,
          draft: true,
        };

        axios
          .post(
            import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
            { ...blogObj, blog_id },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          )
          .then(() => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("Draft Saved!");

            setTimeout(() => {
              navigate("/dashboard/blogs?tab=draft");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            return toast.error(response.data.error);
          });
      });
    }
  };

  const deleteBlog = (blog, access_token, target) => {
    let { blog_id } = blog;

    target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-blog",
        { blog_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        target.removeAttribute("disabled");

        if (data.status === "done") {
          toast.success("Blog Deleted!");

          // Redirect to the home page after successful deletion
          navigate("/");
        } else {
          toast.error("Failed to delete the blog. Please try again.");
        }
      })
      .catch((err) => {
        target.removeAttribute("disabled");
        console.log("Error deleting blog:", err);
        toast.error("Failed to delete the blog. Please try again.");
      });
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={theme == "light" ? darkLogo : lightLogo} alt="logo" />
        </Link>

        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          {!blog_id ? (
            <button
              className="btn-dark py-2 px-3.5"
              onClick={handlePublishEvent}
            >
              Publish
            </button>
          ) : (
            <button
              className="btn-dark py-2 px-3.5"
              onClick={handlePublishEvent}
            >
              Re Publish
            </button>
          )}
          {!blog_id ? (
            <button className="btn-light py-2 px-3.5" onClick={handleSaveDraft}>
              Save Draft
            </button>
          ) : (
            <button
              className="btn-dark py-2 px-3.5"
              onClick={(e) => deleteBlog(blog, access_token, e.target)}
            >
              Delete
            </button>
          )}
        </div>
      </nav>
      <Toaster />

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={banner}
                  alt="banner"
                  className="z-20"
                  onError={handleImgUploadingError}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-7 leading-tight placeholder:opacity-40 bg-white"
              rows={1}
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>
            <hr className="w-full opacity-10 my-4" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
