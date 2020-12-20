let a = 5;
console.log(a);
const funA = () => {
    console.log(a);
    a = 3
}

const funB = () => {
    console.log(a);
    a = 4
}
export {
    funA,
    funB
};
