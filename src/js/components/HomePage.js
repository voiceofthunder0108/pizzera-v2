import {select, templates, classNames} from '../settings.js';
import utils from '../utils.js';

class HomePage{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.carousel();
    this.initPages();
  }

  render(){
    const thisHome = this;
    
    const generatedHTML = templates.homePage();                                         /* generate HTML based on template */
    thisHome.element = utils.createDOMFromHTML(generatedHTML);                          /* create element using utils.createElementFromHTML */
    const homeContainer = document.querySelector(select.containerOf.homePage);          /* find menu container */
    homeContainer.appendChild(thisHome.element);                                        /* add element to menu */

    thisHome.dom = {
      wrapper: this.element,
    };
  }

  carousel() {
    // eslint-disable-next-line no-undef
    new Flickity(select.containerOf.carousel, {
      imagesLoaded: true,
      pageDots: true,
      percentPosition: false,
      autoPlay: true,
      prevNextButtons: false,
    });
  }

  initPages() {
    const thisHome = this;
    thisHome.orderElement = document.querySelector('.order-link');
    thisHome.bookingElement = document.querySelector('.booking-link');


    thisHome.orderElement.addEventListener('click', function(event){
      event.preventDefault();
      const orderId = document.getElementById('order');
      thisHome.activatePage(orderId);


    });
    thisHome.bookingElement.addEventListener('click', function(event){
      event.preventDefault();
      const bookingId = document.getElementById('booking');
      thisHome.activatePage(bookingId);
    });
  }
  
  activatePage(pageId){ 
    const thisHome = this;
    pageId.classList.add(classNames.pages.active);
    thisHome.homeId = document.getElementById('home');
    thisHome.homeId.classList.remove(classNames.pages.active);
    const navLinks = document.querySelectorAll(select.nav.links);

    for(let navLink of navLinks){

      if(navLink.getAttribute('href') == '#' + thisHome.homeId.id){
        navLink.classList.remove(classNames.nav.active); 
      }
      if(navLink.getAttribute('href') == '#' + pageId.id){
        navLink.classList.add(classNames.nav.active);
      }
    }
  }
}

export default HomePage;