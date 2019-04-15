<template>
    <v-dialog
      v-model="loader"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        :color="colorCode"
        dark
      >
        <v-card-text>
          Please stand by
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>
<script>
import {COLOR_CODE} from '@/data/macros.js'
export default {
        props: ['loader'],
         data() {
      return {
        colorCode:COLOR_CODE
      }}
}
</script>
