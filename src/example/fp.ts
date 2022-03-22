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
