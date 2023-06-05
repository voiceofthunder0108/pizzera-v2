import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id; 
    thisProduct.data = data; 

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.prepareCartProductParams();
  }
 
  renderInMenu(){
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);              /* generate HTML based on template */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);               /* create element using utils.createElementFromHtml */
    const menuContainer = document.querySelector(select.containerOf.menu);      /* find menu container */
    menuContainer.appendChild(thisProduct.element);                             /* add element to menu */
  }

  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger.addEventListener('click', function(event){           /* START: add event listener to clickable trigger on event click */
      event.preventDefault();                                                         /* prevent default action for event */
      const activeProduct = document.querySelector(select.all.menuProductsActive);    /* find active product (product that has active class) */
      console.log('activeProduct:', activeProduct);

      
      if(activeProduct && activeProduct != thisProduct.element){                      /* if there is active product and it's not thisProduct.element, remove class active from it */
        activeProduct.classList.remove('active');
      }
      thisProduct.element.classList.toggle('active');                                 /* toggle active class on thisProduct.element */
    });
  }
  
  initOrderForm(){
    const thisProduct = this;                                                         //console.log(this.initAccordion);

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for (let input of thisProduct.formInputs){
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  
  processOrder(){
    const thisProduct = this;                                                                   //console.log('processOrder:', thisProduct);
    const formData = utils.serializeFormToObject(thisProduct.form);                             // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      
    let price = thisProduct.data.price;                                                         // set price to default price
      
    for(let paramId in thisProduct.data.params){                                                // for every category (param)...
      const param = thisProduct.data.params[paramId];                                           // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: ... }
        
      for(let optionId in param.options){                                                       // for every option in this category
        const option = param.options[optionId];                                                 // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);       // check if there is param with a name of paramId in formData and if it includes optionId
        if(optionSelected){
          if(!option.default){                                                                  // check if the option is not default
            price += option.price;                                                              // add option price to price variable
          }
        } else if(option.default){                                                              // check if the option is default
          price -= option.price;                                                                // reduce price variable
        }
          
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

        if(optionImage){
          if (optionSelected){
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }
          else{
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;                                                      // multiply price by amount
    thisProduct.priceElem.innerHTML = price;                                                      // update calculated price in the HTML
    console.log('Update price:', price);
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct()
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};
    
    for(let paramId in thisProduct.data.params){                                            // for very category (param)
      const param = thisProduct.data.params[paramId];
    
      params[paramId] = {                                                                   // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        label: param.label,
        options: {}
      };
    
      for(let optionId in param.options){                                                   // for every option in this category
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
        if(optionSelected) {
          params[paramId].options[optionId] = option.label;                                 // option is selected!
        }
      }
    }
    return params;
  }
}

export default Product;