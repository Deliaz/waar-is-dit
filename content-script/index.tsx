import { postalCodeRegex } from "./const";
import { sendToBackground } from "@plasmohq/messaging";

// Function to create a popup for postal codes
function createPopup() {
  const popup = document.createElement('div');
  popup.style.cssText = 'padding: 10px; display: none; position: absolute; z-index: 1000; border: 1px solid black; background-color: white; width: 350px; height: 350px;';
  document.body.appendChild(popup); // Append the popup to the body

  return popup;
}

// Function to create a wrapper around found postal codes
function createWrapper(postCode: string) {
  const wrapper = document.createElement('span');
  wrapper.style.cssText = 'position: relative; display: inline-block; outline: 2px solid transparent;';
  const contentSpan = document.createElement('span');
  contentSpan.textContent = postCode;
  let popup = null; // Popup is not created initially

  wrapper.onmouseenter = () => {
    wrapper.style.outlineColor = 'orange';
    wrapper.style.cursor = 'pointer';
  };
  wrapper.onmouseleave = (e) => {
    if (popup && e.relatedTarget !== popup && !popup.contains(e.relatedTarget)) {
      wrapper.style.outlineColor = 'transparent';
      popup.style.display = 'none';
    }
  };

  // Additional logic to handle mouse leaving the popup
  const handlePopupMouseLeave = (e) => {
    if (!wrapper.contains(e.relatedTarget) && e.relatedTarget !== wrapper) {
      popup.style.display = 'none';
      wrapper.style.outlineColor = 'transparent';
    }
  };

  wrapper.onclick = async (event) => {
    if (!popup) {
      popup = createPopup();
      // Attach mouse leave event listener to popup
      popup.addEventListener('mouseleave', handlePopupMouseLeave);
    }

    if (popup.style.display === 'none' || popup.style.display === '') {
      const rect = wrapper.getBoundingClientRect();
      popup.style.left = `${rect.left}px`;
      popup.style.top = `${rect.bottom + window.scrollY}px`;
      popup.style.display = 'block';

      popup.innerHTML = '<div>Loading data...</div>'; // Default loading message
      const resp = await sendToBackground({
        name: "get-map-url",
        body: {
          postCode: postCode
        }
      });

      if (!resp) {
        popup.innerHTML = '<span>Not found</span>';
      } else {
        popup.innerHTML = `<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${resp}"></iframe>`;
      }
    } else {
      popup.style.display = 'none';
    }
    event.stopPropagation(); // Prevent further propagation of the current event in the capturing and bubbling phases
  };

  wrapper.appendChild(contentSpan);
  return wrapper;
}

// Function to walk the DOM and process text nodes
function walkTheDOM(node, func) {
  node.childNodes.forEach(child => {
    if (child.nodeType === 3) { // Node.TEXT_NODE
      func(child);
    } else if (child.nodeType === 1) { // Element
      walkTheDOM(child, func);
    }
  });
}

// Function to wrap postal codes within text nodes
function wrapPostalCodes(node) {
  const matches = [...node.nodeValue.matchAll(postalCodeRegex)];
  if (matches.length > 0) {
    const docFragment = document.createDocumentFragment();
    let lastIndex = 0;
    matches.forEach(match => {
      const [text, index] = [match[0], match.index];
      if (index > lastIndex) {
        docFragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex, index)));
      }
      docFragment.appendChild(createWrapper(text));

      lastIndex = index + text.length;
    });
    if (lastIndex < node.nodeValue.length) {
      docFragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex)));
    }
    node.parentNode.replaceChild(docFragment, node);
  }
}

export function initContentScript() {
  walkTheDOM(document.body, wrapPostalCodes);

  document.addEventListener('DOMContentLoaded', () => {
    walkTheDOM(document.body, wrapPostalCodes);
  });
}
