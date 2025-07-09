export default function decorate(block){
    console.log("block children", block.children);
    const[idEl, oneEl,twoEl,threeEl]=block.children;
    const id = idEl?.querySelector('p')?.textContent || null;
    if (id) {
        block.setAttribute('id', id);
    }
    block.classList.add('container');
}