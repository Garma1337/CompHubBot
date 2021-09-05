const { TextChannel } = require('discord.js');

/**
 * Creates a pagination object
 * @param elements
 * @param currentPage
 * @param elementsPerPage
 * @returns {{numPages: number, offset: number, elements, limit: number, currentPage: number}}
 */
// eslint-disable-next-line func-names
TextChannel.prototype.createPagination = function (elements, currentPage, elementsPerPage) {
  const numElements = elements.length;
  const numPages = Math.ceil(numElements / elementsPerPage);

  if (currentPage <= 1) {
    currentPage = 1;
  }

  if (currentPage > numPages) {
    currentPage = numPages;
  }

  const offset = (currentPage - 1) * elementsPerPage;
  const limit = Number(offset) + Number(elementsPerPage);

  const slicedElements = elements.slice(offset, limit);

  return {
    numPages,
    offset,
    limit,
    elements: slicedElements,
    currentPage,
  };
};
