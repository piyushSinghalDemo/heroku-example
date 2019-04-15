<template lang="html">
  <!-- <v-flex xs12 style="padding:0px;"> -->
    <v-menu ref="menu2" :close-on-content-click="false" :disabled="disabled" v-model="menu2" :return-value.sync="date" :nudge-right="40"
      lazy transition="scale-transition" offset-y full-width min-width="290px">
      <v-text-field slot="activator" :disabled="disabled" v-model="calenderDate" label="Date" append-icon="event"></v-text-field>
      <v-date-picker v-model="date" :disabled="disabled" @input="emitChange" no-title></v-date-picker>
    </v-menu>
  <!-- </v-flex> -->
</template>

<script>
export default {
  name: 'Calender',
  data() {
    return {
        menu2: false,
        date: null,
        calenderDate:this.input,
        customFormat:null,
    }
  },
  props: ['input','format','disabled'],
  watch:{
    input(newValue) {  
            this.calenderDate = newValue;
    },
     date (val) {
        this.calenderDate = this.parseDate(this.date)
      },
      format(newValue) {  
            this.customFormat = newValue;
    },
  },
  methods: {
    emitChange: function () {
      this.calenderDate = this.parseDate(this.date);
      this.$refs.menu2.save(this.calenderDate);
      this.$emit('update', this.calenderDate)
    },
    parseDate (date) {
       if (!date) return null

       if(!this.customFormat || this.customFormat == 'yyyy-mm-dd') return date

        const [year, month, day] = date.split('-')
        return `${month}-${day}-${year}`
    }
  }
}
</script>