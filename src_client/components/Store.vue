<template>
<v-container class="about-doom-squad">
  <v-layout>
    <v-flex lg6>
      <h1>Store</h1>

      <p>Thank you for your interest in DooM D3vices, Mil-sim enhancement devices for the 21st century. If you are looking for a hardware D3VICE to take your game to the next level, you're at the right place!</p>

      <v-container>
        <v-layout>
          <v-flex>
            <h3>D3VICE Product List</h3>

            <v-data-table
                :headers="headers"
                :items="items"
                hide-actions
            >
                <template slot="items" slot-scope="props">
                    <td>{{ props.item.sku }}</td>
                    <td>{{ props.item.title }}</td>
                    <td>{{ props.item.description }}</td>
                    <td>{{ props.item.price }}</td>
                </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </v-container>

      <v-container grid-list-md text-xs-left>
        <v-layout row>
          <v-flex>
            <p>All D3VICES are made to order. To place an order, please e-mail <a href="mailto:info@doomsquadairsoft.com">info@doomsquadairsoft.com</a></p>
          </v-flex>
        </v-layout>
      </v-container>

    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
export default {
  name: 'Store',
  data () {
      return {
          headers: [
              {
                  text: 'SKU',
                  align: 'left',
                  sortable: false,
                  value: 'sku'
              },
              {
                text: 'Title',
                align: 'left',
                sortable: false,
                value: 'title'
              },
              {
                text: 'Description',
                align: 'left',
                sortable: false,
                value: 'description'
              },
              {
                  text: 'Price',
                  value: 'price',
                  align: 'right',
                  sortable: false
              }
          ],
          items: [
              {
                  sku: 'DOOM001',
                  description: 'A 900MHz wireless device with two buttons, a keyswitch, and RGB LED lightstrip. Perfect for King of the Hill or Sector Control games. Suitable for remote areas with several hundred meters between control points.',
                  title: 'D3VICE 2 Button Multifunction',
                  price: '$999.99'
              },
              {
                  sku: 'DOOM002',
                  description: 'Connects 900HMz D3VICES to a Wi-Fi network, enabling them to communicate with Controlpointer game server.',
                  title: 'D3VICE Wi-Fi Gateway',
                  price: '$888.88'
              },
              {
                  sku: 'DOOM003',
                  description: 'A 900MHz wireless inert C4 bomb prop with numeric kepad. Integrates seamlessly with Controlpointer game server to keep track of arms/disarms, generate unique passcodes, and calculate score. A must-have for Counter-Strike bomb diffusal mode.',
                  title: 'D3VICE T4',
                  price: '$777.77'
              },
              {
                  sku: 'DOOM004',
                  description: 'Simulated artillery with player-loadable inert shells. Shells contain electronics which prevent the same shell from being "fired" twice.',
                  title: 'D3VICE Artillery',
                  price: '$666.66'
              },
              {
                  sku: 'DOOM005',
                  description: 'Simulated RPG which utilizes an infrared laser. Attach the receiver box to a vehicle, and when the RPG "hits" the vehicle, the red light on the receiver box lights up, notifying the vehicle crew that they are "dead"',
                  title: 'D3VICE Laser RPG',
                  price: '$555.55'
              },
          ]
      }
    }
}
</script>


<style>
</style>
