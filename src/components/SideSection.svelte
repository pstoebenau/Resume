<div>
  <div class="side-section" id="objective">
    <div class="section-header">
      OBJECTIVE
    </div>
    <p>{data.Objective}</p>
  </div>
  
  <div class="side-section" id="skills">
    <div class="section-header">
      <p>SKILLS</p>
    </div>
    {#each Object.entries(data.Skills) as skill}
    <div class="section-title">
      <p>{skill[0]}</p>
    </div>
    <p class="skill-list">{@html skill[1]}</p>
    {/each}
  </div>
  
  <div class="side-section" id="projects">
    <div class="section-header">
      <p>PERSONAL PROJECTS</p>
    </div>
    <div class="project-list">
      {#each Object.entries(data["Personal Project"]) as project}
      <a href={project[1]}>
        <p>
          <b>{project[0]}</b><i>, Github</i>
          <img src="./images/link.svg" alt="link">
        </p>
      </a>
      {/each}
    </div>
  </div>
  
  <div class="side-section" id="honors">
    <div class="section-header">
      <p>HONORS</p>
    </div>
    {#each data["Honors"] as award}
       <p>{award}</p>
    {/each}
  </div>
</div>

<script lang="ts">
  import data from "@/data.yml";
</script>

<style lang="scss">
#objective p {
  font-size: 11pt;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.section-header {
  display: flex;
  align-items: center;
  font-size: 14pt;
  letter-spacing: 2px;
  font-weight: bold;
  margin-bottom: 10px;
}

.side-section {
  line-height: 1.5;
  margin-bottom: 20px;
}

.project-list {
  p {
    margin: 10px 0;
  }

  img {
    margin-left: 5px;
    height: 15px;
  }
}
</style>
