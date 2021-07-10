registerEmail: async (req, res) => {
  dt = dateTime.create();
  dateNow = dt.format('Y-m-d H:M:S');
  var PID = '';
  var baseurl = 'https://' + req.get('host');

  try {
    var { nama, school, phone, email } = req.body;
    console.log(req.body);
    if (nama === undefined || nama == null || nama == '' || email === undefined || email == null || email == '' || school == undefined || school == null || school == '' || phone == undefined || phone == null || phone == '') {
      res.json({
        'status': 500,
        'message': 'Field Tidak Boleh Kosong!'
      });
    } else {
      var ER = false;
      var ERmsg = '';

      var randomNumber = randomstring.generate({ length: 10, charset: 'hex' });
      var password = await bcrypt.hashSync(randomNumber, 10);
      var Peoples = await People.findOne({ email: email });
      var jtoken = jwt.sign({ message: 'success' }, email, { expiresIn: "1h" });
      var linkUri = baseurl + "/verify/" + jtoken;

      if (Peoples === undefined || Peoples == '' || Peoples == null) {
        var tempPeople = await People.create({
          name: nama,
          nameLetter: '',
          nameEng: '',
          secret: '',
          sex: '',
          phone: phone,
          password,
          validate: '',
          email,
          avatar: '',
          created_at: dateNow,
          updated_at: dateNow
        });

        var insertVerify = await VerifyEmail.create({
          peopleId: tempPeople._id,
          email: email,
          status: "0",
          token: jtoken,
          created_at: dateNow,
          updated_at: dateNow
        });

        var tempSchool = await School.create({
          peopleId: tempPeople._id,
          name: school,
          grade: '',
          cityOfSchool: '',
          curriculum: '',
          schoolAddress: '',
          created_at: dateNow,
          updated_at: dateNow
        })

        var tempPInfo = await PeopleInfo.create({
          peopleId: tempPeople._id,
          cardId: '',
          cardType: '',
          cardNation: '',
          marry: '',
          education: '',
          birthDate: '',
          birthPlace: '',
          drivingLicense: '',
          nickName: '',
          avatarUrl: '',
          gender: '',
          religion: '',
          language: '',
          address: '',
          city: '',
          province: '',
          created_at: dateNow,
          updated_at: dateNow
        });

        var tempData = await Identities.create({
          compId: '0',
          userType: 'student',
          peopleId: tempPeople._id,
          positionId: '',
          titleId: '',
          departId: '0',
          roleId: '',
          ruleId: '',
          number: '',
          code: '',
          secret: '',
          disable: 'enable',
          balance: '',
          groupType: 'normal',
          employDate: '',
          leaveDate: '',
          startTime: '',
          endTime: '',
          subscribe: '',
          registed: '',
          subscribeStart: '',
          subscribeEnd: '',
          api_token: '',
          regId: '',
          pushType: '',
          created_at: dateNow,
          updated_at: dateNow
        });

        PID = tempPeople._id;
      } else {
        ER = true;
        ERmsg = 'Email sudah terdaftar, silahkan gunakan email yang lain!';

        /* THIS IS USING WITH VERIFICATION EMAIL */
        /*
        PID = Peoples._id;
        var dateSend = new Date(Peoples.updated_at);
        var dateNow = new Date(dateNow);
        var diff = (dateNow.getTime() - dateSend.getTime()) / (1000 * 3600);
        var checkVerify = await VerifyEmail.findOne({email: email});
        console.log("Milisecond Diff: " + diff);
        if(diff < 1){
          ER = true;
          ERmsg = 'Please try again in 1 hour!';
        } else {
          if(checkVerify === undefined || checkVerify == null || checkVerify != ''){
            var insertVerify = await VerifyEmail.create({
              peopleId: Peoples._id,
              email: email,
              status: "0",
              token: jtoken,
              created_at: dateNow,
              updated_at: dateNow
            });
          } else {
            if(checkVerify.status == "1"){
              ER = true;
              ERmsg = 'Your email has been verified before!';
            }
          }
        }
        */
      }

      if (!ER) {
        var ranm = randomstring.generate({ length: 6, charset: 'hex' }); // Verification Code
        var vercode = randomstring.generate({ length: 16, charset: 'hex' });
        var api_token = jwt.sign({ code: vercode }, ranm, { expiresIn: 300000 });
        var IdUpdate = await Identities.findOne({ peopleId: PID });
        IdUpdate.code = vercode;
        IdUpdate.updated_at = dateNow;
        await IdUpdate.save();

        var textEmail = "Hello " + nama + ", <br>";
        textEmail += "Selamat datang di SebisLes.<br>";
        textEmail += "Terima kasih sudah bergabung dengan SebisLes. Kami yakin anda akan senang disini!";
        textEmail += "<br>";
        textEmail += "Silahkan untuk login di device anda dengan email yang telah di daftarkan dan password dibawah ini:<br>";
        textEmail += "Lalu silahkan untuk masukkan Nomer validasi di bawah ini. <br>";
        //textEmail		+= "<a href='" + linkUri + "'>" + linkUri + "</a><br>";
        //textEmail		+= "<br>After you verify email account, you can login with this password below:"
        textEmail += "Password: <u><b>" + randomNumber + "</b></u><br>";
        textEmail += "Kode Validasi: <u><b>" + ranm + "</b></u>";
        textEmail += "<br><br><br>";
        textEmail += "Regards,<br>";
        textEmail += "SebisLes Staff";

        let transporter = nodemailer.createTransport({
          host: "m005.dapurhosting.com",
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: "noreply@sbstech.co.id",
            pass: "fvjvCY^%*3423",
          },
        });

        let info = await transporter.sendMail({
          from: '"No-Reply System Admin" <noreply@sbstech.co.id>',
          to: email,
          subject: "SebisLes User Email",
          text: "",
          html: textEmail
        });

        if (Peoples !== undefined && Peoples != null && Peoples != '') {
          Peoples.password = password;
          Peoples.updated_at = dateNow;
          await Peoples.save();
        };

        res.json({
          'status': 200,
          'message': 'OK',
          'data': { 'token': api_token }
        });
      } else {
        res.json({
          'status': 500,
          'message': ERmsg
        });
      }
    }
  } catch (error) {
    res.json({
      'status': 500,
      'message': error.message
    });
  };
},