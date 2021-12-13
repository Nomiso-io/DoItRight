import React from 'react';
import Pagination from 'react-js-pagination';

interface IProps {
  pageRangeDisplayed: number;
  activePage: number;
  itemsCountPerPage: number;
  totalItemsCount: number;
  handleChange: any;
}

const RenderPagination = (props: IProps) => {
  return (
    <div>
      <Pagination
        hideDisabled
        prevPageText={'<'}
        nextPageText={'>'}
        firstPageText={'<<'}
        lastPageText={'>>'}
        pageRangeDisplayed={props.pageRangeDisplayed}
        activePage={props.activePage}
        itemsCountPerPage={props.itemsCountPerPage}
        totalItemsCount={props.totalItemsCount}
        onChange={props.handleChange}
        activeClass='active-li-item'
        activeLinkClass='active-link'
      />
    </div>
  );
};

export default RenderPagination;
