<div>
  <div class="section" id="education">
    <div class="section-divider">
      <img src="./images/university.svg" alt="team">
      <div class="vertical-line"></div>
    </div>
    <div class="section-content">
      <div class="section-header">
        <p>EDUCATION</p>
        <div class="dot"></div>
        <div class="line"></div>
      </div>
      <div class="line-container">
        <p class="section-title">{data.Education.college}</p>
        <p>{data.Education.location}</p>
      </div>
      <div class="line-container">
        <p style="font-style: italic">{data.Education.degree}</p>
        <p>{data.Education.gradDate}</p>
      </div>
      <p>GPA: {data.Education.gpa}</p>
    </div>
  </div>
  
  <div class="section" id="experience">
    <div class="section-divider">
      <img src="./images/edit.svg" alt="team">
      <div class="vertical-line"></div>
    </div>
    <div class="section-content">
      <div class="section-header">
        <p>PROFESSIONAL EXPERIENCE</p>
        <div class="dot"></div>
        <div class="line"></div>
      </div>
      {#each experiences as experience}
        <div class="line-container">
          <a href="{experience.url}" target=blank>
            <p class="section-title">
              {experience.name}
              <img class='inline-icon' src="./images/link.svg" alt="link">
            </p>
          </a>
          <p>{experience.location}</p>
        </div>
        <div class="line-container">
          <i>{experience.role}</i>
          <p>{experience.dateRange}</p>
        </div>
        <ul>
          {#each experience.description as str}
            <li>{str}</li>
          {/each}
        </ul>
      {/each}
    </div>
  </div>
  
  <div class="section" id="hobbies">
    <div class="section-divider">
      <img src="./images/hobby.svg" alt="team">
      <div class="vertical-line"></div>
    </div>
    <div class="section-content">
      <div class="section-header">
        <p>HOBBIES</p>
        <div class="dot"></div>
        <div class="line"></div>
      </div>
      <div class="line-container">
        {#each hobbies as hobby}
          <div class="hobby">
            <p class="section-title">{hobby.name}</p>
            <ul>
              {#each hobby.description as str}
                <li>{str}</li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>
  </div>
  
  <!-- <div class="section" id="relevant-coursework">
    <div class="section-divider">
      <img src="./images/document.svg" alt="team">
      <div class="vertical-line"></div>
    </div>
    <div class="section-content">
      <div class="section-header">
        <p>RELEVANT COURSEWORK</p>
        <div class="dot"></div>
        <div class="line"></div>
      </div>
      <div class="line-container">
        {#each coursework as course}
          <p>{course}</p>
        {/each}
      </div>
    </div>
  </div> -->

  <div class="section" id="campus-involvement">
    <div class="section-divider">
      <img src="./images/team.svg" alt="team">
      <div class="vertical-line"></div>
    </div>
    <div class="section-content">
      <div class="section-header">
        <p>CAMPUS INVOLVEMENT</p>
        <div class="dot"></div>
        <div class="line"></div>
      </div>
      {#each clubs as club}
        <div class="line-container">
          <div style="display: flex">
            <p class="section-title">{club.name}</p>
            <i>, {club.role}</i>
          </div>
          <p>{club.dateRange}</p>
        </div>
      {/each}
    </div>
  </div>
</div>

<script lang="ts">
import data from "@/data.yml"

const experiences: Experience[] = data["Experience"];
const hobbies: Hobby[] = data["Hobbies"];
const coursework: string[] = data["Coursework"];
const clubs: CampusInvolvement[] = data["Campus Involvement"];

interface Experience {
  name: string;
  url: string;
  location: string;
  role: string;
  dateRange: string;
  description: string[];
}

interface Hobby {
  name: string;
  description: string[];
}

interface CampusInvolvement {
  name: string;
  role: string;
  dateRange: string;
}
</script>

<style lang="scss">
.section-title {
  display: flex;
  align-items: center;
  font-weight: bold;

  img {
    margin-left: 5px;
    height: 15px;
  }
}

.line-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.section-header {
  display: flex;
  align-items: center;
  font-size: 14pt;
  letter-spacing: 2px;
  font-weight: bold;
  margin-bottom: 10px;

  .dot {
    margin-left: 5px;
  }

  .line {
    flex-grow: 1;
  }
}

.section {
  display: flex;
  line-height: 1.5;
  margin-bottom: 10px;

  ul {
    margin: 0;
  }

  .section-content {
    flex-grow: 1;
    margin-top: 5px;
  }
  
  .section-divider {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 10px;
  
    img {
      width: 40px;
    }
  
    .vertical-line {
      height: calc(100% - 30px);
    }
  }
}

.hobby {
  width: 50%;

  ul {
    padding-inline-start: 20px;
  }
}

.line {
  border-top: 1px solid #111;
}

.vertical-line {
  border-left: 1px solid #111;
}

.dot {
  width: 4px;
  height: 4px;
  background-color: #111;
  border-radius: 2px;
}

.inline-icon {
  display: inline;
  height: 1rem;
}
</style>
