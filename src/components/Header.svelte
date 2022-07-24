<script lang="ts">
  import data from "../data.yml";
</script>

<div id="header">
  <div id="name-description">
    <div>
      <p id="name">{data["name"]}</p>
      <p id="description">{data["title"]}</p>
    </div>
  </div>
  <div id="contact-info">
    <div class="icon-description">
      <img src="/images/location.svg" alt="location: ">
      <p>{data["location"]}</p>
    </div>
    <div class="icon-description">
      <img src="/images/email.svg" alt="email: ">
      <p><a href="mailto:{data["email"]}">{data["email"]}</a></p>
    </div>
    <div class="icon-description">
      <img src="/images/phone.svg" alt="phone: ">
      <p><a href="tel:{data["phone"]}">{data["phone"]}</a></p>
    </div>
    <div class="icon-description">
      <img src="/images/web.svg" alt="personal website: ">
      <p><a href="https://{data["personalSite"]}">{data["personalSite"]}</a></p>
    </div>
  </div>
  <div class="dotted-line"></div>
</div>

<style lang="scss">
#header {
  margin-bottom: 15px;
}

#name-description {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;

  #name {
    font-size: 22pt;
    font-weight: 550;
    letter-spacing: 1.5px;
  }

  #description {
    color: #333;
    font-size: 16pt;
  }
}

#contact-info {
  display: flex;
  justify-content: space-between;
  width: 90%;
  padding: 0 5%;

  .icon-description {
    display: flex;
    flex-direction: row;
    margin: 0 10px;
    text-align: center;

    p {
      align-self: center;
      margin-left: 8px;
      font-size: 11pt;
    }

    img {
      height: 20px;
    }
  }
}

.dotted-line {
  border: none;
  border-top: 1.5px dotted #111;
  margin: 5px 4%;
}
</style>
