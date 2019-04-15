<template>
	<div>
	<v-layout row>
		<v-flex xs12>
			<!-- <v-spacer></v-spacer> -->
			<ul class="breadcrumb">
				<li v-for="(route, index) in breadcrumbsList" :key="index">
					<router-link :to="{name: route.name}">
						{{route.value}}
					</router-link>
				</li>
			</ul>
		</v-flex>
	</v-layout>	
	</div>
</template>

<script>
	 export default {
	 	name: "Breadcrumb",
	 	data() {
	 		return {
	 			breadcrumbsList: []
	 		}
	 	},
	 	mounted() {
	 		this.CreateBreadCrump()
	 	},
	 	methods: {
	 		CreateBreadCrump() {
				//  debugger;
	 			// console.log(this.$session.get('access_token'))
	 			var breadcrumbsstring = this.$breadcrumbs[0].meta['breadcrumb']
	 			var crump = breadcrumbsstring.split('/')
	 			for (var i = 0; i < crump.length; i++) {
	 				var key = crump[i]
	 				key = key.replace(/ /g, '')
	 				key = key.toLowerCase()
	 				if (key === 'home') {
	 					key = 'dashboard'
	 				}
	 				var json = {
	 					'name': key,
	 					'value': crump[i]
	 				}
	 				this.breadcrumbsList.push(json)
				 }
				//  debugger;
				//  console.log("breadcrumbsList" +JSON.stringify(this.breadcrumbsList));
	 		}
	 	}
	 }
</script>
<style>
.breadcrumb > li + li:before {
    padding: 0 5px;
    color: black;
    content: "/\A0";
	/* background-color: white */
}
.breadcrumb{
	background-color: inherit !important;
	padding: 0px !important;
	margin: 0px !important;
}
</style>
