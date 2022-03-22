export const singleton = <IN, OUT>(fn: (input: IN) => OUT) => {
  let product: OUT;
  return (input: IN) => {
    if (product) {
      return product;
    }
    product = fn(input);
    return product;
  };
};
