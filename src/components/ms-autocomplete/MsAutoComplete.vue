<template>
  <div style="position:relative">
    <ms-input
      v-model="value"
      class="form-control"
      rules="required"
      type="text"
      @change="change"
      @keydown.down="down"
      @keydown.up="up"
      @keydown.enter="enter"
      @focus="focus"
      @blur="blur"
      @input="input"
    />
    <div
      v-if="openSuggestion"
      class="dropdown-menu"
      style="width:100%"
    >
      <li
        v-for="suggestion in matches"
        :key="suggestion.index"
        :class="{'active': isActive(suggestion.index)}"
        @click="suggestionClick(suggestion.index)"
      >
        <a href="#">{{ suggestion.value }}</a>
      </li>
    </div>
  </div>
</template>

<script>
export default {
  name: "MsAutoCoplete",

  props: {
    suggestions: {
      type: Array,
      required: true
    },

    valueDefault: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      open: false,
      current: 0,
      value: this.valueDefault,
      selected: false
    };
  },

  computed: {
    matches() {
      return this.suggestions.filter(str => {
        return (
          str.value
            .toLowerCase()
            .indexOf(this.value ? this.value.toLowerCase() : "") >= 0
        );
      });
    },

    openSuggestion() {
      return this.matches.length != 0 && this.open === true;
    }
  },

  watch: {
    valueDefault(valNew, valOld) {
      this.value = valNew;
    }
  },

  methods: {
    enter() {
      this.value = this.matches.find(x => {
        return x.index == this.current;
      }).value;
      this.open = false;
    },

    up() {
      if (this.current > 0) this.current--;
    },

    down() {
      if (this.current < this.matches.length - 1) this.current++;
    },

    isActive(index) {
      return index === this.current;
    },

    change() {
      if (this.open == false) {
        this.open = true;
        this.current = this.current || 0;
      }
    },

    input() {
      if(!this.selected){
        this.open = true;
      }
      this.selected = false;
      this.current = this.matches.length > 0 ? this.matches[0].index : 0;
      this.$emit("input", this.value);
    },

    focus() {
      if (!this.value) {
        this.open = true;
        this.current = this.current || 0;
      }
    },

    blur() {
      this.open = false;
    },

    suggestionClick(index) {
      this.value = this.matches.find(x => {
        return x.index == index;
      }).value;
      this.open = false;
      this.selected = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.dropdown-menu {
  position: absolute;
  background: yellow;
  top: 36px;
  margin: 0;
  width: 100%;
  list-style-type: none;
  z-index: 100000;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

li {
  cursor: pointer;
  height: 36px;
  line-height: 36px;
  white-space: nowrap;
  padding: 0 8px;
}

li:hover {
  background: #e8f5f7;
}

.open {
  display: block;
}

.active {
  background: #e8f5f7;
  color: #14aa8a;
}
</style>
