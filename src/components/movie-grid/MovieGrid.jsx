import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import "./movie-grid.css";
import MovieCard from "../movie-card/MovieCard";
import Button, { OutlineButton } from "../button/Button";
import Input from "../input/Input";
import tmdbApi, { category, movieType, tvType } from "../../api/tmdbApi";
import Select from "react-select";
const MovieGrid = (props) => {
  const [items, setItems] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);

  const { keyword } = useParams();

  const [genres, setGenres] = useState([]);

  const [activeGenre, setActiveGenre] = useState(null);

  const [sortType, setSortType] = useState("default");

  const options = [
    { value: "default", label: "Sort By" },
    { value: "a-z", label: "A-Z" },
    { value: "z-a", label: "Z-A" },
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  useEffect(() => {
    const fetchGenres = async () => {
      let response = null;
      if (props.category === category.movie) {
        response = await tmdbApi.getMovieGenres(); // جلب الأنواع الخاصة بالأفلام
      } else {
        response = await tmdbApi.getTvGenres(); // جلب الأنواع الخاصة بالمسلسلات
      }
      console.log("Response:", response);
      setGenres(response.genres); // تخزين الأنواع في الحالة
    };

    fetchGenres();
  }, [props.category]);

  useEffect(() => {
    const getList = async () => {
      let response = null;
      if (keyword === undefined) {
        const params = {};
        switch (props.category) {
          case category.movie:
            response = await tmdbApi.getMoviesList(movieType.upcoming, {
              params,
            });
            break;
          default:
            response = await tmdbApi.getTvList(tvType.popular, { params });
        }
      } else {
        const params = {
          query: keyword,
        };
        response = await tmdbApi.search(props.category, { params });
      }
      setItems(response.results);
      setTotalPage(response.total_pages);
    };
    getList();
  }, [props.category, keyword]);
  console.log(items);
  const loadMore = async () => {
    let response = null;
    if (keyword === undefined) {
      const params = {
        page: page + 1,
      };
      switch (props.category) {
        case category.movie:
          response = await tmdbApi.getMoviesList(movieType.upcoming, {
            params,
          });
          break;
        default:
          response = await tmdbApi.getTvList(tvType.popular, { params });
      }
    } else {
      const params = {
        page: page + 1,
        query: keyword,
      };
      response = await tmdbApi.search(props.category, { params });
    }
    setItems([...items, ...response.results]);
    setPage(page + 1);
  };
  const handleGenreClick = async (genreId) => {
    const params = {
      with_genres: genreId,
    };
    const response = await tmdbApi.discover(props.category, { params });
    setItems(response.results);
    setTotalPage(response.total_pages);
    setPage(1);
    setActiveGenre(genreId);
  };

  // const filteredItems = activeGenre
  //   ? items.filter((item) => item.genre_ids.includes(activeGenre)) // تصفية العناصر بناءً على النوع النشط
  //   : items;
  const handleSortChange = (selectedOption) => {
    setSortType(selectedOption.value);
  };

  const sortedItems = [...items].sort((a, b) => {
    switch (sortType) {
      case "a-z":
        return (
          a.title?.localeCompare(b.title || "") ||
          a.name?.localeCompare(b.name || "")
        );
      case "z-a":
        return (
          b.title?.localeCompare(a.title || "") ||
          b.name?.localeCompare(a.name || "")
        );
      case "newest":
        return (
          new Date(b.release_date || b.first_air_date || 0) -
          new Date(a.release_date || a.first_air_date || 0)
        );
      case "oldest":
        return (
          new Date(a.release_date || a.first_air_date || 0) -
          new Date(b.release_date || b.first_air_date || 0)
        );
      default:
        return 0;
    }
  });

  return (
    <>
      <div className="filter-section section mb-3">
        <div className="search">
          <MovieSearch category={props.category} keyword={keyword} />
        </div>
        <div className="sort">
          <Select
            value={options.find((option) => option.value === sortType)}
            onChange={handleSortChange}
            options={options}
            className="react-select"
            classNamePrefix="custom-select"
            styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: "black",
                color: "white",
                fontSize: "1rem",
                borderRadius: "30px",
                border: state.isFocused
                  ? "1px solid #ff0000"
                  : "1px solid #ff0000",
                outline: "none",
                boxShadow: "none",
                "&:hover": {
                  border: "1px solid #ff0000",
                },
                cursor: "pointer",
              }),
              singleValue: (base) => ({
                ...base,
                color: "white",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? "#ff0000"
                  : state.isFocused
                  ? "#ff0000"
                  : "black",
                color: "white",
                cursor: "pointer",
                ":active": {
                  backgroundColor: "#ff0000",
                },
              }),
            }}
          />
        </div>
      </div>

      <div className="movie-grid__loadmore">
        <OutlineButton
          className={`small genere-btn ${activeGenre === null ? "active" : ""}`}
          onClick={() => handleGenreClick(null)}
        >
          All
        </OutlineButton>
        {genres.slice(0, 9).map((genre) => (
          <OutlineButton
            key={genre.id}
            className={`small genere-btn ${
              activeGenre === genre.id ? "active" : ""
            }`}
            onClick={() => handleGenreClick(genre.id)}
          >
            {genre.name}
          </OutlineButton>
        ))}
      </div>

      <div className="movie-grid">
        {/* {filteredItems.map((item, i) => (
          <MovieCard category={props.category} item={item} key={i} />
        ))} */}
        {sortedItems.map((item, i) => (
          <MovieCard category={props.category} item={item} key={i} />
        ))}
      </div>
      {page < totalPage ? (
        <div className="movie-grid__loadmore">
          <OutlineButton className="small" onClick={loadMore}>
            Load more
          </OutlineButton>
        </div>
      ) : null}
    </>
  );
};
const MovieSearch = (props) => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState(props.keyword ? props.keyword : "");

  const goToSearch = useCallback(() => {
    if (keyword.trim().length > 0) {
      navigate(`/${category[props.category]}/search/${keyword}`);
    }
  }, [keyword, props.category, navigate]);

  useEffect(() => {
    const enterEvent = (e) => {
      e.preventDefault();
      if (e.keyCode === 13) {
        goToSearch();
      }
    };
    document.addEventListener("keyup", enterEvent);
    return () => {
      document.removeEventListener("keyup", enterEvent);
    };
  }, [keyword, goToSearch]);

  return (
    <div className="movie-search">
      <Input
        type="text"
        placeholder="Enter keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <Button className="small" onClick={goToSearch}>
        Search
      </Button>
    </div>
  );
};

export default MovieGrid;
// طريقه اخرى للسيرش
// const MovieSearch = (props) => {
//   const navigate = useNavigate();
//   const [keyword, setKeyword] = useState(props.keyword ? props.keyword : "");

//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       if (keyword.trim().length > 0) {
//         navigate(`/${category[props.category]}/search/${keyword}`);
//       }
//     }, 500);

//     return () => clearTimeout(delayDebounce);
//   }, [keyword, props.category, navigate]);

//   return (
//     <div className="movie-search">
//       <Input
//         type="text"
//         placeholder="Enter keyword"
//         value={keyword}
//         onChange={(e) => setKeyword(e.target.value)}
//       />
//       {/* ممكن تسيبي الزرار أو تشيليه */}
//       {/* <Button className="small" onClick={() => navigate(`/${category[props.category]}/search/${keyword}`)}>Search</Button> */}
//     </div>
//   );
// };
