import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// 40870479-78b31d6ebe4b8efc40d0da54d

const refs = {
	searchForm: document.querySelector('.search-form'),
	galleryBox: document.querySelector('.gallery'),
	searchInput: document.querySelector('.search-input'),
	loadBtn: document.querySelector('.load-more'),
};

refs.loadBtn.style.display = 'none';

let searchItem = '';
let page = 1;
let totalResult = 0;

async function getRequest(name, page = 1) {
	Notiflix.Loading.standard();

	const BASE_URL = 'https://pixabay.com/api/';
	const API_KEY = '40870479-78b31d6ebe4b8efc40d0da54d';

	const params = new URLSearchParams({
		key: API_KEY,
		q: name,
		image_type: 'photo',
		orientation: 'horizontal',
		safesearch: true,
		page,
		per_page: 40,
	});
	const response = await axios.get(`${BASE_URL}`, { params });
	Notiflix.Loading.remove();

	return response;
}

async function loadMoreImages() {
	try {
		page++;
		const { hits: arrayCards, totalHits: totalCards } = await getRequest(
			searchItem,
			page
		);

		if (arrayCards.length === 0) {
			throw new Error();
		}
		const markup = createMarkup(arrayCards);
		refs.galleryBox.insertAdjacentHTML('beforeend', markup);
		Notiflix.Notify.success(
			`Loaded 40 more images. Total: ${refs.galleryBox.children.length} images.`
		);

		totalResult = totalCards;
	} catch (error) {
		Notiflix.Notify.failure('No more images to load.');
	}
}

function createMarkup(arrayItem) {
	const marking = arrayItem.map(
		({
			tags,
			webformatURL,
			largeImageURL,
			views,
			downloads,
			likes,
			comments,
		}) =>
			`<div class="photo-card">
            <a class="gallery-link" href="${largeImageURL}">
                  <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
                  <div class="info">
                     <p class="info-item">
                        <b>Likes</b>
                        ${likes}
                     </p>
                     <p class="info-item">
                        <b>Views</b>
                        ${views}
                     </p>
                     <p class="info-item">
                        <b>Comments</b>
                        ${comments}
                     </p>
                     <p class="info-item">
                        <b>Downloads</b>
                        ${downloads}
                     </p>
                  </div>
            </a>
         </div>`
	);
	return marking.join('');
}

function onSubmit(e) {
	e.preventDefault();

	page = 1;

	refs.galleryBox.innerHTML = '';

	searchItem = refs.searchInput.value;

	if (!searchItem) {
		Notiflix.Notify.failure('You have to write something in the search');
		return;
	}
	loadMoreImages();

	getRequest(searchItem, page)
		.then(({ data: { hits: arrayCards, totalHits: totalCards } }) => {
			if (arrayCards.length === 0) {
				throw new Error();
			}

			const markup = createMarkup(arrayCards);
			refs.galleryBox.insertAdjacentHTML('beforeend', markup);
			Notiflix.Notify.success(`Hooray! We found ${totalCards} images.`);
			SimpleLightbox.refresh();

			totalResult = totalCards;
		})
		.catch(() => {
			if (refs.galleryBox.innerHTML.trim() === '') {
				Notiflix.Notify.failure(
					'Sorry, there are no images matching your search query. Please try again.'
				);
			}
		});

	refs.searchForm.reset();
}

function onLoadMoreClick() {
	loadMoreImages();
}
refs.searchForm.addEventListener('submit', onSubmit);
refs.loadBtn.addEventListener('click', onLoadMoreClick);
