it('should execute error js code', async () => {
      const accessToken = jwtService.sign({ username: 'testuser', id: 1 });
      const sourceCode = join(__dirname, 'sources', 'error.js');

      return await request(app.getHttpServer())
        .post(`/executions?language=${Language.JS}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('sourceCode', sourceCode)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toEqual(ExecutionStatus.ERROR);
        });
    });