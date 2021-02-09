<div id="container">
  <div id="page">
    <div id="margin">
      <Header></Header>
      <div id="grid-container">
        <SideSection></SideSection>
        <MainSection></MainSection>
      </div>
    </div>
  </div>
</div>

<script lang="ts">
  import Header from "@/components/Header.svelte";
  import SideSection from "@/components/SideSection.svelte";
  import MainSection from "@/components/MainSection.svelte";
</script>

<style scoped>
#container {
  display: flex;
  justify-content: center;
}

#page {
  width: 21.59cm;
  height: 27.94cm;
  background: white;
  display: block;
  /* box-shadow: 0 0 0.5cm rgba(0,0,0,0.5); */
}

#margin {
  padding: 0.5cm;
}

#grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-row-gap: 15px;
  grid-column-gap: 10px;
  grid-auto-flow: column;
}
</style>
