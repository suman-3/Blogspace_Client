import { Link, Outlet, useNavigate } from "react-router-dom";
import darkLogo from "../imgs/darkspie.png";
import lightLogo from "../imgs/lightspie.png";
import { useContext, useEffect, useState } from "react";
import { ThemeContext, UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";
import { storeInSession } from "../common/session";

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

  const [userNavPanel, setUserNavPanel] = useState(false);

  let { theme, setTheme } = useContext(ThemeContext);

  let navigate = useNavigate();

  const {
    userAuth = {},
    userAuth: { access_token, profile_img, new_notification_available } = {},
    setUserAuth,
  } = useContext(UserContext);

  useEffect(() => {
    if (access_token) {
      axios
        .get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notification", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleUserNavPanel = () => {
    setUserNavPanel((currentVal) => !currentVal);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  };
  const handleSearch = (e) => {
    let query = e.target.value;
    console.log(e);

    if (e.keyCode === 13 && query.length) {
      navigate(`/search/${query}`);
      setSearchBoxVisibility(false);
    }
  };

  const changeTheme = () => {
    let newTheme = theme == "light" ? "dark" : "light";

    setTheme(newTheme);

    document.body.setAttribute("data-theme", newTheme);

    storeInSession("theme", newTheme);
  };

  return (
    <>
      <nav className="navbar z-50">
        <Link to="/" className="flex-none w-30 h-7 lg:w-60 lg:h-10 ">
          <img
            src={theme == "light" ? darkLogo : lightLogo}
            alt="logo"
            className="object-cover"
          />
        </Link>

        {/* {new_notification_available} */}

        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
            (searchBoxVisibility ? "show" : "hide")
          }
        >
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Search"
              className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-14"
              onKeyDown={handleSearch}
            />
          </form>

          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>

        <div className="flex items-center gap-2 md:gap-6 ml-auto ">
          <button
            className="md:hidden bg-grey w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/10"
            onClick={() => setSearchBoxVisibility((currentVal) => !currentVal)}
          >
            <i className="fi fi-rr-search text-xl mt-1.5"></i>
          </button>

          <Link to="editor" className="hidden md:flex gap-2 link rounded-md">
            <i className="fi fi-rr-file-edit"></i>
            <p>Write </p>
          </Link>

          <button className="w-10 lg:w-12 h-10 lg:h-12 rounded-full bg-grey relative hover:bg-black/10">
            <i
              className={
                "fi fi-rr-" +
                (theme == "light" ? "moon-stars" : "sun") +
                " text-2xl block mt-1"
              }
              onClick={changeTheme}
            ></i>
          </button>

          {access_token ? (
            <>
              <Link to="/dashboard/notifications">
                <button className="w-10 lg:w-12 h-10 lg:h-12 rounded-full bg-grey relative hover:bg-black/10">
                  <i className="fi fi-rr-bell text-2xl block mt-1"></i>
                  {new_notification_available ? (
                    <span className="bg-rose-700 w-3 h-3 rounded-full absolute z-10 top-1 lg:top-1.5 right-2 lg:right-3"></span>
                  ) : (
                    ""
                  )}
                </button>
              </Link>

              <div
                className="relative"
                onClick={handleUserNavPanel}
                onBlur={handleBlur}
              >
                <button className="w-9 h-9 mt-1">
                  <img
                    src={profile_img}
                    alt=""
                    className="w-full h-full object-cover rounded-full border border-1px border-black/10"
                  />
                </button>

                {userNavPanel ? <UserNavigationPanel /> : ""}
              </div>
            </>
          ) : (
            <>
              <Link className="btn-dark py-2" to="/signin">
                Sign In
              </Link>
              <Link className="btn-light py-2 hidden md:block" to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
