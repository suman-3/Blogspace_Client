const LoadMoreDataBtn = ({ state, fetchData, additionalParam }) => {
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <button
        onClick={() => fetchData({ ...additionalParam, page: state.page + 1 })}
        className="btn-dark py-2  rounded-md flex items-center gap-2 center w-full justify-center"
      >
        Load More
      </button>
    );
  }
};

export const LoadMoreWhiteDataBtn = ({ state, fetchData, additionalParam }) => {
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <button
        onClick={() => fetchData({ ...additionalParam, page: state.page + 1 })}
        className="btn-light py-2  rounded-ful flex items-center gap-2 center w-full justify-center mb-5
        hover:text-dark-grey duration-300 "
      >
        Load More
      </button>
    );
  }
};

export default LoadMoreDataBtn;

