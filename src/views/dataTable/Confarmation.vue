<template>
    <v-card>
        <v-card-title style="background:#494949;color:white;padding: 0px 7px;">
            <v-list style="background:#494949;color:white;">
                <v-list-tile-content>
                 
                    <v-list-tile-title>{{heading}}</v-list-tile-title>
                </v-list-tile-content>
            </v-list>
            <v-spacer></v-spacer>
            <v-icon @click="onCancel" color="white">close</v-icon>
        </v-card-title>
        <v-card-text>
           <!--  -->
            <label>{{label}}</label>
        </v-card-text>
        <v-card-actions>
            <v-btn outline color="indigo" flat @click="onSuccess" style="border-radius:10px">{{lblSuccess}}</v-btn>
                 <v-spacer></v-spacer>
            <v-btn outline color="indigo" flat @click="onCancel" style="border-radius:10px">{{lblCancel||'Cancel'}}</v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>

export default {
    name: 'dataTable',
    data: function () {
        return {

        }
    },
    props: ['heading', 'label', 'lblSuccess', 'lblCancel'],
    methods: {
        onSuccess(){
            this.$emit('onSuccess');
        },
        onCancel(){
            this.$emit('onCancel');
        }
    }
}
</script>
