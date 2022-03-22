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

export const gen_id = (prefix: string) => {
  let id = 1;
  return () => {
    id++;
    return prefix + "_" + id;
  };
};

export const memoize = <IN, OUT>(fn: (input: IN) => OUT) => {
  const products: Map<IN, OUT> = new Map();
  return (input: IN) => {
    if (products.has(input)) {
      return products.get(input) as OUT;
    }
    const product = fn(input);
    products.set(input, product);
    return product;
  };
};
