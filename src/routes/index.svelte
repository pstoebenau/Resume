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
  import Header from "../components/Header.svelte";
  import SideSection from "../components/SideSection.svelte";
  import MainSection from "../components/MainSection.svelte";
</script>

<style scoped>
#container {
  display: flex;
  justify-content: center;
}

#page {
  width: 216mm;
  min-height: 278mm;
  max-height: 278mm;
  display: block;
  background-color: white;
  margin: 0;
  box-shadow: 0 0 0.5cm rgba(0,0,0,0.5);
}
@media print {
  @page {
    margin: 0;
    box-shadow: 0;
  }

  #page {
    box-shadow: unset;
    page-break-after:always;
  }

  * { overflow: visible !important; } 
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
