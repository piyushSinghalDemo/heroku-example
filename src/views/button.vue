<template>
    <v-btn :loading="loading" outline :disabled="loading" 
                    :color="buttonColor" style="border-radius:10px">{{itemText}}</v-btn>
</template>
<script>
import { BTN_COLOR } from '@/data/macros.js';
export default {
    name:'vcButton',
    data() {
      return {
          buttonColor:BTN_COLOR
      }
    },
    props: {
      itemText: String,
      loading: Boolean,
      disabled:Boolean
    }
}
</script>
<style scoped>
.border{
    border-radius:10px;
}
</style>
