<template>
  <sup>
    <a>[注]</a> <span><slot></slot></span>
  </sup>
</template>

<style scoped>
a {
  cursor: pointer;
}

span {
  display: none;
  margin-left: 3px;
  margin-right: 10px;
}

sup:hover span {
  display: initial;
  font-size: smaller;
}
</style>
